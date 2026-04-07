"use client";
import React, { useRef, useState } from "react";

export default function ContactPage() {
  const formRef = useRef(null);
  const [status, setStatus] = useState(""); // '', 'success', 'error'
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    const formData = new FormData(formRef.current);

    try {
      const response = await fetch("https://formsubmit.co/ajax/pathakmansi608@gmail.com", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      // FormSubmit returns: { success: "true", message: "Email sent..." }
      if (result.success === "true") {
        setStatus("success");
        setShowPopup(true);
        formRef.current.reset();
      } else {
        setStatus("error");
        setShowPopup(false);
      }
    } catch {
      setStatus("error");
      setShowPopup(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center pt-28 px-4">
      <section className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border-t-8 border-red-500 animate-fadeIn relative">
        <h1 className="text-4xl font-bold text-red-600 mb-4 text-center">
          Contact Us
        </h1>
        <h2 className="text-lg font-semibold text-red-500 mb-8 text-center">
          We'd love to hear from you!
        </h2>
        {status === "error" && (
          <div className="mb-4 w-full bg-red-100 text-red-700 font-semibold py-3 px-6 rounded text-center animate-fadeInUp">
            Error sending message. Please try again.
          </div>
        )}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6"
          autoComplete="off"
        >
          <div>
            <label className="block font-semibold text-red-700 mb-1" htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              placeholder="Your Name"
              className="w-full px-4 py-2 rounded-md border border-red-300 focus:border-red-500 focus:ring focus:ring-red-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block font-semibold text-red-700 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Your Email"
              className="w-full px-4 py-2 rounded-md border border-red-300 focus:border-red-500 focus:ring focus:ring-red-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block font-semibold text-red-700 mb-1" htmlFor="subject">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              minLength={2}
              placeholder="Subject"
              className="w-full px-4 py-2 rounded-md border border-red-300 focus:border-red-500 focus:ring focus:ring-red-100 outline-none transition"
            />
          </div>
          <div>
            <label className="block font-semibold text-red-700 mb-1" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              placeholder="Your Message"
              className="w-full px-4 py-2 rounded-md border border-red-300 focus:border-red-500 focus:ring focus:ring-red-100 outline-none transition"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-md bg-red-600 text-white font-bold text-lg mt-2 transition-colors duration-300 hover:bg-red-700 shadow"
            style={{ cursor: 'pointer' }}
          >
            Send Message
          </button>
        </form>

        {/* POPUP */}
        {showPopup && (
          <div
            className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-40 z-50"
            onClick={() => setShowPopup(false)}
          >
            <div
              className="bg-white rounded max-w-xs mx-auto p-8 shadow-lg flex flex-col items-center"
              onClick={e => e.stopPropagation()}
            >
              <p className="text-2xl font-bold text-green-600 mb-4">Message Sent!</p>
              <p className="text-gray-800">Your message was sent successfully.</p>
              <button
                className="mt-6 px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700"
                onClick={() => setShowPopup(false)}
                style={{ cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </section>
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(40px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px);}
            100% { opacity: 1; transform: translateY(0);}
          }
          .animate-fadeIn {
            animation: fadeIn 1.2s cubic-bezier(0.23, 1, 0.32, 1);
          }
          .animate-fadeInUp {
            animation: fadeInUp 1s cubic-bezier(0.23, 1, 0.32, 1);
          }
        `}
      </style>
    </main>
  );
}
