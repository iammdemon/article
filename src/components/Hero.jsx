import React from "react";

import { logo } from "../assets";

const Hero = () => {
  return (
    <header className='w-full flex justify-center items-center flex-col'>
      <nav className='flex justify-between items-center w-full mb-10 pt-3'>
        <img src={logo} alt='sumz_logo' className='w-28 object-contain' />

        {/* <button
          type='button'
          onClick={() =>
            window.open("https://github.com/iammdemon", "_blank")
          }
          className='black_btn'
        >
          GitHub
        </button> */}
      </nav>

      <h1 className='head_text'>
        Summarize Research Paper with <br className='max-md:hidden' />
        <span className='orange_gradient '>SUMZ</span>
      </h1>
      <h2 className='desc'>
        Simplify your reading with SUMZ, an open-source Research Paper summarizer
        that transforms lengthy Paper into clear and concise summaries. Also You can make it text to speech and download as PDF.
      </h2>
    </header>
  );
};

export default Hero;
