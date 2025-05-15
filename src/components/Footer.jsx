import React from "react";

const Footer = () => {
  return (
    <footer className='w-full flex justify-center items-center flex-col bg-gray-800 text-white py-10'>
      <div className='flex justify-between items-center w-full max-w-4xl'>
        <p className='text-center text-sm'>
          &copy; {new Date().getFullYear()} SUMZ. All rights reserved.
        </p>

        <div className='flex gap-6'>
          <a
            href='https://github.com/iammdemon'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white hover:text-gray-400'
          >
            GitHub
          </a>
          <a
            href='https://www.linkedin.com/in/iammdemon'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white hover:text-gray-400'
          >
            LinkedIn
          </a>
          <a
            href='mailto:contact@iammdemon.com'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white hover:text-gray-400'
          >
            Contact
          </a>
        </div>
      </div>
      
      <p className='mt-4 text-center text-sm'>
        Developed by <span className='text-blue-400'>Your Name</span>
      </p>
    </footer>
  );
};

export default Footer;
