
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-fitscore-100 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-fitscore-600">FS</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">FitScore</h1>
          <p className="text-muted-foreground max-w-xs">
            Track your fitness journey, compete with friends, and earn rewards as you go.
          </p>
        </div>
        
        <AuthForm />
        
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
