// // app/login/page.tsx
// import LoginForm from "./login-form";
// import { auth } from "@/auth";
// import { redirect } from "next/navigation";

// export default async function LoginPage() {
//   const session = await auth();
//   if (session?.user) {
//     const role = session.user.role;
//     if (role === "ADMIN") redirect("/admin");
//     if (role === "TEACHER") redirect("/teacher/dashboard");
//     if (role === "STUDENT") redirect("/student");
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-100">
//       <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
//         <h2 className="text-3xl font-bold text-center">Login</h2>
//         <LoginForm />
//       </div>
//     </div>
//   );
// }

// app/login/page.tsx
import LoginForm from "./login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    const role = session.user.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "TEACHER") redirect("/teacher/dashboard");
    if (role === "STUDENT") redirect("/student/dashboard");
  }
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/learning.jpg"
          alt="Learning background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-purple-900/50 to-violet-900/70"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-soft-light filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-75"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Form Header */}
          <div className="p-8 pb-6 text-center">
            <div className="mx-auto w-16 h-16  flex items-center justify-center mb-4">
              <Image 
                src="/images/NH.png"
                height={50}
                width={50}
                alt="logo"
              />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-300">Sign in to access your account</p>
          </div>

          {/* Form Content */}
          <div className="px-8 pb-8">
            <LoginForm />
          </div>

          {/* Form Footer */}
          {/* <div className="px-8 py-6 bg-gray-800/50 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign up
              </a>
            </p>
          </div> */}
        </div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-gray-400 text-sm z-10">
        © {new Date().getFullYear()} NoHLAG EXAM. All rights reserved.
      </div>
    </div>
  );
}
