## Error Type
Console Error

## Error Message
Cannot initialize Smart CAPTCHA widget because the `clerk-captcha` DOM element was not found; falling back to Invisible CAPTCHA widget. If you are using a custom flow, visit https://clerk.com/docs/guides/development/custom-flows/authentication/bot-sign-up-protection for instructions


    at async handleSubmit (app/sign-up/[[...sign-up]]/page.tsx:138:22)

## Code Frame
  136 |
  137 |     try {
> 138 |       const result = await signUp.create({
      |                      ^
  139 |         emailAddress: email,
  140 |         password,
  141 |       });

Next.js version: 16.2.10 (Turbopack)
