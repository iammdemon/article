import React, { useState, useEffect } from "react";
import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import jsPDF from "jspdf";

const Demo = () => {
  const [article, setArticle] = useState({ url: "", summary: "" });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(localStorage.getItem("articles"));
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const existingArticle = allArticles.find((item) => item.url === article.url);
    if (existingArticle) return setArticle(existingArticle);

    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];
      setArticle(newArticle);
      setAllArticles(updatedAllArticles);
      localStorage.setItem("articles", JSON.stringify(updatedAllArticles));
    }
  };

  const handleCopy = (copyUrl) => {
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      handleSubmit(e);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Article Summary", 10, 10);
    doc.setFont("times", "normal");
    const lines = doc.splitTextToSize(article.summary, 180);
    doc.text(lines, 10, 20);
    doc.save("summary.pdf");
  };

  // ✅ Text-to-Speech Controls
  const handleReadAloud = () => {
    if (article.summary) {
      const newUtterance = new SpeechSynthesisUtterance(article.summary);
      newUtterance.lang = "en-US";
      newUtterance.rate = 1;
      newUtterance.pitch = 1;

      newUtterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      newUtterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
    }
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form className="relative flex justify-center items-center" onSubmit={handleSubmit}>
          <img src={linkIcon} alt="link-icon" className="absolute left-0 my-2 ml-3 w-5" />
          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            onKeyDown={handleKeyDown}
            required
            className="url_input peer"
          />
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            <p>↵</p>
          </button>
        </form>

        {/* History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.slice().reverse().map((item, index) => (
            <div key={`link-${index}`} onClick={() => setArticle(item)} className="link_card">
              <div className="copy_btn" onClick={() => handleCopy(item.url)}>
                <img
                  src={copied === item.url ? tick : copy}
                  alt={copied === item.url ? "tick_icon" : "copy_icon"}
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="my-10 max-w-full flex flex-col justify-center items-center gap-4">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <>
              <div className="flex flex-col gap-3">
                <h2 className="font-satoshi font-bold text-gray-600 text-xl">
                  Article <span className="blue_gradient">Summary</span>
                </h2>
                <div className="summary_box">
                  <p className="font-inter font-medium text-sm text-gray-700">
                    {article.summary}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                >
                  📄 Download as PDF
                </button>

                {!isSpeaking && (
                  <button
                    onClick={handleReadAloud}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
                  >
                    Read Summery
                  </button>
                )}
                {isSpeaking && !isPaused && (
                  <button
                    onClick={handlePause}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Pause
                  </button>
                )}
                {isPaused && (
                  <button
                    onClick={handleResume}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                  >
                    Resume
                  </button>
                )}
                {isSpeaking && (
                  <button
                    onClick={handleStop}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                  >
                    Stop
                  </button>
                )}
              </div>
            </>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
