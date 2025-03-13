
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-fitscore-100/30 to-transparent z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none z-0" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fitscore-500 to-fitscore-700 flex items-center justify-center mb-4 shadow-lg relative animate-bounce-subtle">
            <div className="absolute inset-0 rounded-full bg-fitscore-500 animate-pulse-ring opacity-50"></div>
            <span className="text-2xl font-bold text-white">FS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2 bg-gradient-to-r from-fitscore-700 to-fitscore-500 bg-clip-text text-transparent">FitScore</h1>
          <p className="text-muted-foreground max-w-xs">
            Track your fitness journey, compete with friends, and earn rewards as you go.
          </p>
        </div>
        
        <AuthForm />
        
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our <a href="#" className="underline hover:text-fitscore-600 transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-fitscore-600 transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
