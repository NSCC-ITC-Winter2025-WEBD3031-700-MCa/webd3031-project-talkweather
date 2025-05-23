import LoginForm from "@/app/(auth)/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import GitHubLoginButton from "./GitHubLoginButton"; // Import the Client Component

export const metadata: Metadata = {
  title: "Login",
  description:
    "Login to HaliWeather account to access your personalized dashboard and connect with like-minded individuals.",
};

interface Props {}

const Login = async ({}: Props) => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-center text-2xl">
            <p className="leading-[1]">Login</p>
          </CardTitle>
          <CardDescription className="text-center">
            Welcome back
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <LoginForm />
          
          {/* Use the GitHub Login Button */}
          <GitHubLoginButton /> {/* This is the Client Component */}
        </CardContent>
        <CardFooter className="flex items-center justify-center gap-1 text-[12px]">
          <p>Don&apos;t have an account?</p>

          <Link href={"/register"} className="!text-[12px] hover:underline">
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
