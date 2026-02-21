import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThreeBackground from "../Components/ThreeBackground";
import sitLogo from "../assets/sit2.jpg";
import deepRightImg from "../assets/branch.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState("");
  const fullText = "...Welcome to Artificial Intelligence and Data Science.";

  useEffect(() => {
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else clearInterval(typingInterval);
    }, 100);
    return () => clearInterval(typingInterval);
  }, []);

  const handleStudentClick = () => navigate("/register");
  const handleAdminClick = () => navigate("/admin-login");

  return (
    <>
      <style>{`
        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 20px;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.3);
          z-index: 1000;
        }

        .bar-image {
          height: 50px;
          width: auto;
          object-fit: contain;
        }

        .bar-right-img {
          height: 50px;
          width: auto;
          object-fit: contain;
          margin-right: 20px;
        }

        .home-center-card {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-top: 80px;
          z-index: 10;
        }

        .typing-container {
          width: 90%;
          max-width: 800px;
          text-align: center;
          margin-bottom: 2rem;
        }

        .typing-text {
          font-family: 'Courier New', monospace;
          font-size: 1.4rem;
          color: #60a5fa;
          margin: 0;
          padding: 20px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(59, 130, 246, 0.4);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
          white-space: pre-wrap;
          word-wrap: break-word;
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
          animation: glow 2s ease-in-out infinite;
        }

        .typing-text::after {
          content: '|';
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 4px 16px rgba(59,130,246,0.2); }
          50% { box-shadow: 0 4px 24px rgba(59,130,246,0.4); }
        }

        .home-card {
          background: transparent;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 340px;
          max-width: 95vw;
          position: relative;
          z-index: 15;
        }

        .home-card h1 {
          font-size: 2.4rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.7rem;
          letter-spacing: 1px;
          text-shadow: 0 2px 8px rgba(59,130,246,0.3);
        }

        .home-card p {
          font-size: 1.15rem;
          color: #94a3b8;
          margin-bottom: 2.2rem;
          text-align: center;
        }

        .home-btn-group {
          display: flex;
          gap: 24px;
          justify-content: center;
          width: 100%;
        }

        .home-btn {
          min-width: 150px;
          padding: 16px 32px;
          border: none;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          background: #3b82f6;
          cursor: pointer;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .home-btn.admin { background: #2563eb; }
        .home-btn:hover { transform: translateY(-3px) scale(1.03); }

        /* ✅ Fix for mobile: keep right image visible but smaller */
        @media (max-width: 800px) {
          .bar-right-img {
            height: 35px;
            margin-right: 10px;
          }
        }

        @media (max-width: 500px) {
          .top-bar {
            padding: 0 10px;
          }

          .bar-image {
            height: 40px;
          }

          .bar-right-img {
            height: 32px;
            margin-right: 8px;
          }
        }
          .bar-title {
  color: #ffffff;
  font-size: clamp(1while userrem, 2vw, 1.4rem);
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(59,130,246,0.6);

  white-space: normal;
  word-break: break-word;
  flex-shrink: 1;

  text-align: center;


      `}</style>

      <ThreeBackground />

      <div className="top-bar">
        <img src={sitLogo} alt="Logo Left" className="bar-image" />
        <div className="bar-title">SRINIVAS INSTITUTE OF TECHNOLOGY</div>
        <img src={deepRightImg} alt="Logo Right" className="bar-right-img" />
      </div>

      <div className="home-center-card">
        <div className="typing-container">
          <pre className="typing-text">{typedText}</pre>
        </div>

        <div className="home-card">
          <h1>AD-Library</h1>
          <p>Choose your role to continue:</p>
          <div className="home-btn-group">
            <button className="home-btn student" onClick={handleStudentClick}>
              Student
            </button>
            <button className="home-btn admin" onClick={handleAdminClick}>
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ThreeBackground from '../Components/ThreeBackground';
// import sitLogo from '../assets/sit2.jpg';
// import deepRightImg from '../assets/branch.png';
//git work
// const HomePage = () => {
//   const navigate = useNavigate();
//   const [typedText, setTypedText] = useState('');
//   const fullText = '...Welcome to Artificial Intelligence and Data Science.';

//   useEffect(() => {
//     let index = 0;
//     const typingInterval = setInterval(() => {
//       if (index <= fullText.length) {
//         setTypedText(fullText.slice(0, index));
//         index++;
//       } else clearInterval(typingInterval);
//     }, 100);
//     return () => clearInterval(typingInterval);
//   }, []);

//   const handleStudentClick = () => navigate('/register');
//   const handleAdminClick = () => navigate('/admin-login');

//   return (
//     <>
//       <style>{`
//         .top-bar {
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 70px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           padding: 0 20px;
//           background: rgba(15, 23, 42, 0.8);
//           backdrop-filter: blur(10px);
//           border-bottom: 1px solid rgba(59, 130, 246, 0.3);
//           z-index: 1000;
//         }

//         .bar-image {
//           height: 50px;
//           width: auto;
//           object-fit: contain;
//         }

//         /* Right image fix */
//         .bar-right-img {
//           height: 50px;
//           width: auto;
//           object-fit: contain;
//           margin-right: 20px; /* add padding from right edge */
//         }

//         .home-center-card {
//           min-height: 100vh;
//           width: 100vw;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           position: relative;
//           margin-top: 80px;
//           z-index: 10;
//         }

//         .typing-container {
//           width: 90%;
//           max-width: 800px;
//           text-align: center;
//           margin-bottom: 2rem;
//         }

//         .typing-text {
//           font-family: 'Courier New', monospace;
//           font-size: 1.4rem;
//           color: #60a5fa;
//           margin: 0;
//           padding: 20px;
//           background: rgba(15, 23, 42, 0.6);
//           border: 1px solid rgba(59, 130, 246, 0.4);
//           border-radius: 12px;
//           backdrop-filter: blur(10px);
//           box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
//           white-space: pre-wrap;
//           word-wrap: break-word;
//           text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
//           animation: glow 2s ease-in-out infinite;
//         }

//         .typing-text::after { content: '|'; animation: blink 1s step-end infinite; }
//         @keyframes blink { 0%,100%{opacity:1;}50%{opacity:0;} }
//         @keyframes glow { 0%,100%{box-shadow:0 4px 16px rgba(59,130,246,0.2);}50%{box-shadow:0 4px 24px rgba(59,130,246,0.4);} }

//         .home-card {
//           background: transparent;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           min-width: 340px;
//           max-width: 95vw;
//           position: relative;
//           z-index: 15;
//         }

//         .home-card h1 { font-size: 2.4rem; font-weight: 700; color: #fff; margin-bottom: 0.7rem; letter-spacing: 1px; text-shadow:0 2px 8px rgba(59,130,246,0.3);}
//         .home-card p { font-size: 1.15rem; color:#94a3b8; margin-bottom:2.2rem; text-align:center;}
//         .home-btn-group { display:flex; gap:24px; justify-content:center; width:100%; }
//         .home-btn { min-width:150px; padding:16px 32px; border:none; border-radius:14px; font-size:1.1rem; font-weight:600; color:#fff; background:#3b82f6; cursor:pointer; transition:0.2s; display:flex; align-items:center; justify-content:center; gap:12px;}
//         .home-btn.admin { background:#2563eb; }
//         .home-btn:hover { transform:translateY(-3px) scale(1.03); }

//         @media (max-width: 800px) {
//           .bar-right-img { display: none; }
//         }
//       `}</style>

//       <ThreeBackground />

//       <div className="top-bar">
//         <img src={sitLogo} alt="Logo Left" className="bar-image" />
//         <img src={deepRightImg} alt="Logo Right" className="bar-right-img" />
//       </div>

//       <div className="home-center-card">
//         <div className="typing-container">
//           <pre className="typing-text">{typedText}</pre>
//         </div>

//         <div className="home-card">
//           <h1>AD-Library</h1>
//           <p>Choose your role to continue:</p>
//           <div className="home-btn-group">
//             <button className="home-btn student" onClick={handleStudentClick}>Student</button>
//             <button className="home-btn admin" onClick={handleAdminClick}>Admin</button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default HomePage;
