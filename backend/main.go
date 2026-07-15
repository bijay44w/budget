package main

import (
	"log"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// GORM Database Schemas
type User struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	ClerkID string `gorm:"uniqueIndex" json:"clerk_id"`
	Name    string `gorm:"not null" json:"name"`
}

func getCurrentUser(c *fiber.Ctx) (User, error) {
	clerkID := c.Get("X-Clerk-User-Id")
	if clerkID == "" {
		return User{}, fiber.NewError(fiber.StatusUnauthorized, "Missing Auth Header")
	}

	var user User
	err := db.Where("clerk_id = ?", clerkID).First(&user).Error
	if err != nil {
		name := c.Get("X-Clerk-User-Name")
		if name == "" {
			name = "User"
		}
		user = User{
			ClerkID: clerkID,
			Name:    name,
		}
		if err := db.Create(&user).Error; err != nil {
			return User{}, err
		}
	}
	return user, nil
}


type Budget struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	Name           string     `gorm:"not null" json:"name"`
	Income         float64    `gorm:"not null" json:"income"`
	UserID         uint       `gorm:"not null" json:"user_id"`
	ParentBudgetID *uint      `json:"parent_budget_id"`
	Tags           string     `json:"tags"` // Comma-separated list of tags
	Categories     []Category `gorm:"constraint:OnDelete:CASCADE;" json:"categories"`
}

type Category struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	BudgetID uint    `gorm:"not null" json:"budget_id"`
	Name     string  `gorm:"not null" json:"name"`
	Amount   float64 `gorm:"not null" json:"amount"`
	Type     string  `gorm:"not null" json:"type"` // "Expense", "Savings", "Investment"
}

// Request/Response DTOs and Validation Structs
type CategoryInput struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount"`
	Type   string  `json:"type"`
}

type CreateBudgetInput struct {
	Name       string          `json:"name"`
	Income     float64         `json:"income"`
	Tags       string          `json:"tags"`
	Categories []CategoryInput `json:"categories"`
}

type ForkInput struct {
	Name string `json:"name"`
}

type DiffItem struct {
	Name         string  `json:"name"`
	Type         string  `json:"type"`
	ParentAmount float64 `json:"parent_amount"`
	ForkAmount   float64 `json:"fork_amount"`
	Status       string  `json:"status"` // "Added", "Modified", "Removed", "Unchanged"
}

type BudgetSummary struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Income       float64 `json:"income"`
	MonthlySpend float64 `json:"monthly_spend"`
	Savings      float64 `json:"savings"`
	SavingsRate  float64 `json:"savings_rate"`
}

type CompareResponse struct {
	Budget1 BudgetSummary `json:"budget1"`
	Budget2 BudgetSummary `json:"budget2"`
}

var db *gorm.DB

func main() {
	var err error
	// Establish SQLite database connection
	db, err = gorm.Open(sqlite.Open("budgettree.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto-migrate the schemas
	err = db.AutoMigrate(&User{}, &Budget{}, &Category{})
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	// Seed the database if empty
	seedDatabase(db)

	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Add CORS middleware to connect with frontend client (Next.js runs on 3000)
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, X-Clerk-User-Id, X-Clerk-User-Name",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Setup API Routes
	api := app.Group("/api")
	api.Get("/budgets", handleGetBudgets)
	api.Post("/budgets", handleCreateBudget)
	api.Get("/budgets/:id", handleGetBudgetDetail)
	api.Put("/budgets/:id", handleUpdateBudget)
	api.Post("/budgets/:id/fork", handleForkBudget)
	api.Get("/budgets/:id/diff", handleGetDiff)
	api.Get("/budgets/compare/pair", handleCompareBudgets)

	log.Println("Starting server on :8080...")
	log.Fatal(app.Listen(":8080"))
}

// Handlers

func handleGetBudgets(c *fiber.Ctx) error {
	var budgets []Budget
	query := db.Preload("Categories")

	currentUser, err := getCurrentUser(c)
	if err == nil {
		query = query.Where("parent_budget_id IS NULL OR user_id = ?", currentUser.ID)
	} else {
		query = query.Where("parent_budget_id IS NULL")
	}

	tagFilter := c.Query("tag")
	if tagFilter != "" {
		// SQLite case-insensitive tags filtering
		query = query.Where("lower(tags) LIKE ?", "%"+strings.ToLower(tagFilter)+"%")
	}

	if err := query.Find(&budgets).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to retrieve budgets: "+err.Error())
	}

	return c.JSON(budgets)
}

func handleCreateBudget(c *fiber.Ctx) error {
	currentUser, err := getCurrentUser(c)
	if err != nil {
		return err
	}

	var input CreateBudgetInput
	if err := c.BodyParser(&input); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request payload")
	}

	// Validate payload manually
	if err := validateCreateInput(input); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	budget := Budget{
		Name:   input.Name,
		Income: input.Income,
		UserID: currentUser.ID,
		Tags:   input.Tags,
	}

	// Execute within a GORM transactional block
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&budget).Error; err != nil {
			return err
		}

		for _, catInput := range input.Categories {
			cat := Category{
				BudgetID: budget.ID,
				Name:     catInput.Name,
				Amount:   catInput.Amount,
				Type:     catInput.Type,
			}
			if err := tx.Create(&cat).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to create budget: "+err.Error())
	}

	// Fetch preloaded budget to return
	var createdBudget Budget
	if err := db.Preload("Categories").First(&createdBudget, budget.ID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to load created budget")
	}

	return c.Status(fiber.StatusCreated).JSON(createdBudget)
}

func handleGetBudgetDetail(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid budget ID")
	}

	var budget Budget
	if err := db.Preload("Categories").First(&budget, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "Budget not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch budget: "+err.Error())
	}

	currentUser, err := getCurrentUser(c)
	if err == nil {
		if budget.ParentBudgetID != nil && budget.UserID != currentUser.ID {
			return fiber.NewError(fiber.StatusForbidden, "You do not own this budget blueprint")
		}
	} else {
		if budget.ParentBudgetID != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Authentication required to view custom forks")
		}
	}

	return c.JSON(budget)
}

func handleUpdateBudget(c *fiber.Ctx) error {
	currentUser, err := getCurrentUser(c)
	if err != nil {
		return err
	}

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid budget ID")
	}

	var budget Budget
	if err := db.First(&budget, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "Budget not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to look up budget: "+err.Error())
	}

	if budget.UserID != currentUser.ID {
		return fiber.NewError(fiber.StatusForbidden, "You do not own this budget blueprint")
	}

	var input CreateBudgetInput
	if err := c.BodyParser(&input); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid request payload")
	}

	// Validate input
	if err := validateCreateInput(input); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}

	// Update inside transaction
	err = db.Transaction(func(tx *gorm.DB) error {
		budget.Name = input.Name
		budget.Income = input.Income
		budget.Tags = input.Tags

		if err := tx.Save(&budget).Error; err != nil {
			return err
		}

		// Delete existing categories
		if err := tx.Where("budget_id = ?", budget.ID).Delete(&Category{}).Error; err != nil {
			return err
		}

		// Insert new categories
		for _, catInput := range input.Categories {
			cat := Category{
				BudgetID: budget.ID,
				Name:     catInput.Name,
				Amount:   catInput.Amount,
				Type:     catInput.Type,
			}
			if err := tx.Create(&cat).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to update budget: "+err.Error())
	}

	// Return updated budget
	var updatedBudget Budget
	if err := db.Preload("Categories").First(&updatedBudget, budget.ID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to load updated budget")
	}

	return c.JSON(updatedBudget)
}

func handleForkBudget(c *fiber.Ctx) error {
	currentUser, err := getCurrentUser(c)
	if err != nil {
		return err
	}

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid budget ID")
	}

	var parent Budget
	if err := db.Preload("Categories").First(&parent, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "Parent budget not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to look up parent budget: "+err.Error())
	}

	var forkInput ForkInput
	c.BodyParser(&forkInput) // Optional new name

	forkName := forkInput.Name
	if forkName == "" {
		forkName = "Fork of " + parent.Name
	}

	parentIDCopy := parent.ID
	fork := Budget{
		Name:           forkName,
		Income:         parent.Income,
		UserID:         currentUser.ID,
		ParentBudgetID: &parentIDCopy,
		Tags:           parent.Tags,
	}

	// Transactional copy logic
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&fork).Error; err != nil {
			return err
		}

		for _, cat := range parent.Categories {
			newCat := Category{
				BudgetID: fork.ID,
				Name:     cat.Name,
				Amount:   cat.Amount,
				Type:     cat.Type,
			}
			if err := tx.Create(&newCat).Error; err != nil {
				return err
			}
		}
		return nil
	})

	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fork budget: "+err.Error())
	}

	// Return full preloaded forked budget
	var forkedBudget Budget
	if err := db.Preload("Categories").First(&forkedBudget, fork.ID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to load forked budget")
	}

	return c.Status(fiber.StatusCreated).JSON(forkedBudget)
}

func handleGetDiff(c *fiber.Ctx) error {
	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid budget ID")
	}

	var fork Budget
	if err := db.Preload("Categories").First(&fork, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fiber.NewError(fiber.StatusNotFound, "Budget not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "Failed to fetch budget: "+err.Error())
	}

	currentUser, err := getCurrentUser(c)
	if err == nil {
		if fork.ParentBudgetID != nil && fork.UserID != currentUser.ID {
			return fiber.NewError(fiber.StatusForbidden, "You do not own this budget blueprint")
		}
	} else {
		if fork.ParentBudgetID != nil {
			return fiber.NewError(fiber.StatusUnauthorized, "Authentication required to view custom forks")
		}
	}

	if fork.ParentBudgetID == nil {
		return c.JSON([]DiffItem{}) // Base templates have no diffs
	}

	var parent Budget
	if err := db.Preload("Categories").First(&parent, *fork.ParentBudgetID).Error; err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "Parent budget not found in system: "+err.Error())
	}

	// Compute semantic in-memory diff
	diffItems := computeDiff(parent, fork)
	return c.JSON(diffItems)
}

func handleCompareBudgets(c *fiber.Ctx) error {
	id1Str := c.Query("id1")
	id2Str := c.Query("id2")

	if id1Str == "" || id2Str == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Missing id1 or id2 query parameters")
	}

	id1, err1 := strconv.Atoi(id1Str)
	id2, err2 := strconv.Atoi(id2Str)
	if err1 != nil || err2 != nil {
		return fiber.NewError(fiber.StatusBadRequest, "Invalid budget IDs")
	}

	var budget1 Budget
	if err := db.Preload("Categories").First(&budget1, id1).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Budget 1 not found")
	}

	var budget2 Budget
	if err := db.Preload("Categories").First(&budget2, id2).Error; err != nil {
		return fiber.NewError(fiber.StatusNotFound, "Budget 2 not found")
	}

	res := CompareResponse{
		Budget1: summarizeBudget(budget1),
		Budget2: summarizeBudget(budget2),
	}

	return c.JSON(res)
}

// Helpers

func validateCreateInput(input CreateBudgetInput) error {
	if strings.TrimSpace(input.Name) == "" {
		return fiber.NewError(fiber.StatusBadRequest, "Budget name is required")
	}
	if input.Income < 0 {
		return fiber.NewError(fiber.StatusBadRequest, "Monthly income cannot be negative")
	}
	for _, cat := range input.Categories {
		if strings.TrimSpace(cat.Name) == "" {
			return fiber.NewError(fiber.StatusBadRequest, "Category name is required")
		}
		if cat.Amount < 0 {
			return fiber.NewError(fiber.StatusBadRequest, "Category amount cannot be negative")
		}
		t := strings.TrimSpace(cat.Type)
		if t != "Expense" && t != "Savings" && t != "Investment" {
			return fiber.NewError(fiber.StatusBadRequest, "Category type must be Expense, Savings, or Investment")
		}
	}
	return nil
}

func computeDiff(parent Budget, fork Budget) []DiffItem {
	parentMap := make(map[string]Category)
	for _, cat := range parent.Categories {
		parentMap[cat.Name] = cat
	}

	forkMap := make(map[string]Category)
	for _, cat := range fork.Categories {
		forkMap[cat.Name] = cat
	}

	var result []DiffItem
	visited := make(map[string]bool)

	// Iterate through parent categories (preserving parent order)
	for _, pCat := range parent.Categories {
		visited[pCat.Name] = true
		if fCat, exists := forkMap[pCat.Name]; exists {
			// Exists in both budgets
			status := "Unchanged"
			if pCat.Amount != fCat.Amount || pCat.Type != fCat.Type {
				status = "Modified"
			}
			result = append(result, DiffItem{
				Name:         pCat.Name,
				Type:         fCat.Type,
				ParentAmount: pCat.Amount,
				ForkAmount:   fCat.Amount,
				Status:       status,
			})
		} else {
			// Removed in fork
			result = append(result, DiffItem{
				Name:         pCat.Name,
				Type:         pCat.Type,
				ParentAmount: pCat.Amount,
				ForkAmount:   0,
				Status:       "Removed",
			})
		}
	}

	// Iterate through fork categories to catch Added items
	for _, fCat := range fork.Categories {
		if !visited[fCat.Name] {
			result = append(result, DiffItem{
				Name:         fCat.Name,
				Type:         fCat.Type,
				ParentAmount: 0,
				ForkAmount:   fCat.Amount,
				Status:       "Added",
			})
		}
	}

	return result
}

func summarizeBudget(b Budget) BudgetSummary {
	var monthlySpend float64
	var savings float64

	for _, cat := range b.Categories {
		switch cat.Type {
		case "Expense":
			monthlySpend += cat.Amount
		case "Savings", "Investment":
			savings += cat.Amount
		}
	}

	savingsRate := 0.0
	if b.Income > 0 {
		savingsRate = (savings / b.Income) * 100
	}

	return BudgetSummary{
		ID:           b.ID,
		Name:         b.Name,
		Income:       b.Income,
		MonthlySpend: monthlySpend,
		Savings:      savings,
		SavingsRate:  savingsRate,
	}
}

func seedDatabase(db *gorm.DB) {
	// Check if seeded already
	var count int64
	db.Model(&User{}).Count(&count)
	if count > 0 {
		return
	}

	log.Println("Seeding mock data...")

	// Create Primary Mock User
	mockUser := User{ID: 1, Name: "Alex Dev"}
	db.Create(&mockUser)

	// Create Student template
	studentBudget := Budget{
		ID:     1,
		Name:   "Minimal Student Budget Blueprint",
		Income: 1500,
		UserID: 1,
		Tags:   "Student, Frugal",
		Categories: []Category{
			{Name: "Rent & Utilities", Amount: 700, Type: "Expense"},
			{Name: "Groceries", Amount: 250, Type: "Expense"},
			{Name: "Transit", Amount: 80, Type: "Expense"},
			{Name: "Textbooks & Gear", Amount: 50, Type: "Expense"},
			{Name: "High Yield Savings", Amount: 200, Type: "Savings"},
			{Name: "Emergency Fund", Amount: 100, Type: "Savings"},
			{Name: "Leisure & Coffee", Amount: 120, Type: "Expense"},
		},
	}
	db.Create(&studentBudget)

	// Create FIRE template
	fireBudget := Budget{
		ID:     2,
		Name:   "FIRE Blueprint (Financial Independence)",
		Income: 8000,
		UserID: 1,
		Tags:   "FIRE, Remote Worker, Tech",
		Categories: []Category{
			{Name: "Housing & Mortgage", Amount: 2000, Type: "Expense"},
			{Name: "Organic Groceries", Amount: 600, Type: "Expense"},
			{Name: "Utility Bills", Amount: 300, Type: "Expense"},
			{Name: "Broad Market ETFs", Amount: 4000, Type: "Savings"},
			{Name: "Tech Stocks", Amount: 500, Type: "Investment"},
			{Name: "Travel & Leisure", Amount: 600, Type: "Expense"},
		},
	}
	db.Create(&fireBudget)

	// Create a Forked example from the FIRE Blueprint with visual diff modifications
	parentID := uint(2)
	forkedBudget := Budget{
		ID:             3,
		Name:           "My Personal FIRE Journey",
		Income:         8000,
		UserID:         1,
		ParentBudgetID: &parentID,
		Tags:           "FIRE, Remote Worker, Tech",
		Categories: []Category{
			{Name: "Housing & Mortgage", Amount: 1800, Type: "Expense"},   // Modified
			{Name: "Organic Groceries", Amount: 700, Type: "Expense"},    // Modified
			{Name: "Utility Bills", Amount: 300, Type: "Expense"},         // Unchanged
			{Name: "Broad Market ETFs", Amount: 4500, Type: "Savings"},    // Modified
			{Name: "Tech Stocks", Amount: 500, Type: "Investment"},       // Unchanged
			// Travel & Leisure is Removed
			{Name: "Gym & Wellness", Amount: 150, Type: "Expense"},       // Added
			{Name: "Side Hustle Investing", Amount: 50, Type: "Savings"}, // Added
		},
	}
	db.Create(&forkedBudget)

	log.Println("Mock data seeded successfully!")
}
