import React, { useState } from 'react';
import { NeonGradientCard } from "@/components/magicui/neon-gradient-card";
import BoxReveal from "@/components/magicui/box-reveal";
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/login", {  // Updated endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        console.log(response.ok);
        setSuccessMessage("Login successful.");
        localStorage.setItem('email', email );
        localStorage.setItem('password', password);
        // setErrorMessage("");
        // localStorage.setItem('user_id', data.user_id);
        // console.log(localStorage.getItem('user_id'));
        navigate('/linkedin-search');  // Adjust navigation as needed
      } else {
        setErrorMessage(data.error || "Login failed.");
      }
    } catch (error) {
      setErrorMessage("Login failed. Please try again later.");
    }
  };

  return (
    <>
      <div className="mb-4">
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <p className="text-[1.5rem] font-bold">
            Welcome Back! Log in to your account.
          </p>
        </BoxReveal>
      </div>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Login
        </button>
      </form>
      <div className="mt-3">
        <a href="/signup" className="hover:underline text-sm">Sign Up</a>
      </div>
      {errorMessage && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-500 text-white py-2 text-center">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-500 text-white py-2 text-center">
          {successMessage}
        </div>
      )}
    </>
  );
}

export default Login;
