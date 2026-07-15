import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] dark:bg-[#0b0e11] transition-all p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#070a0e] rounded-3xl border border-slate-100 dark:border-slate-850 p-8 shadow-sm flex flex-col items-center">
        <SignIn forceRedirectUrl="/explore" appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-transparent shadow-none border-0 w-full p-0",
            headerTitle: "text-slate-900 dark:text-white font-share-mono",
            headerSubtitle: "text-slate-500 dark:text-slate-400",
            socialButtonsIconButton: "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
            formButtonPrimary: "bg-green-600 hover:bg-green-700 text-white dark:bg-[#a8ff35] dark:text-black dark:hover:bg-[#a8ff35]/90 transition-all font-share-mono text-sm",
            formFieldLabel: "text-slate-700 dark:text-slate-350 font-share-mono text-xs",
            formFieldInput: "bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl p-3",
            footerActionText: "text-slate-500 dark:text-slate-400",
            footerActionLink: "text-green-600 dark:text-[#a8ff35] hover:underline"
          }
        }} />
      </div>
    </div>
  );
}
