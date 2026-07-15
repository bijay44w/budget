package main

import (
	"testing"
)

func TestComputeDiff(t *testing.T) {
	parent := Budget{
		ID:     1,
		Income: 5000,
		Categories: []Category{
			{Name: "Rent", Amount: 2000, Type: "Expense"},
			{Name: "Groceries", Amount: 500, Type: "Expense"},
			{Name: "Savings", Amount: 1000, Type: "Savings"},
		},
	}

	fork := Budget{
		ID:             2,
		ParentBudgetID: &parent.ID,
		Income:         5000,
		Categories: []Category{
			{Name: "Rent", Amount: 1800, Type: "Expense"},    // Modified
			{Name: "Savings", Amount: 1200, Type: "Savings"},  // Modified
			{Name: "Coffee", Amount: 100, Type: "Expense"},   // Added
			// Groceries is Removed
		},
	}

	diffs := computeDiff(parent, fork)

	// We expect:
	// 1. Rent: Modified (2000 -> 1800)
	// 2. Groceries: Removed (500 -> 0)
	// 3. Savings: Modified (1000 -> 1200)
	// 4. Coffee: Added (0 -> 100)

	expected := map[string]struct {
		status       string
		parentAmount float64
		forkAmount   float64
	}{
		"Rent":      {"Modified", 2000, 1800},
		"Groceries": {"Removed", 500, 0},
		"Savings":   {"Modified", 1000, 1200},
		"Coffee":    {"Added", 0, 100},
	}

	if len(diffs) != 4 {
		t.Fatalf("Expected 4 diff items, got %d", len(diffs))
	}

	for _, d := range diffs {
		exp, found := expected[d.Name]
		if !found {
			t.Errorf("Unexpected diff item: %s", d.Name)
			continue
		}
		if d.Status != exp.status {
			t.Errorf("For %s, expected status %s, got %s", d.Name, exp.status, d.Status)
		}
		if d.ParentAmount != exp.parentAmount {
			t.Errorf("For %s, expected parent amount %f, got %f", d.Name, exp.parentAmount, d.ParentAmount)
		}
		if d.ForkAmount != exp.forkAmount {
			t.Errorf("For %s, expected fork amount %f, got %f", d.Name, exp.forkAmount, d.ForkAmount)
		}
	}
}
