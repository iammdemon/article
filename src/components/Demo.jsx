import React, { useState, useEffect, useRef } from "react";
import { copy, linkIcon, loader, tick } from "../assets";
import { useLazyGetSummaryQuery } from "../services/article";
import jsPDF from "jspdf";

const Demo = () => {
  const [article, setArticle] = useState({ url: "", summary: "" });
  const [allArticles, setAllArticles] = useState([]);
  const [copied, setCopied] = useState("");
  const [volume, setVolume] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voice, setVoice] = useState(null);
  const utteranceRef = useRef(null);

  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("articles"));
    if (stored) setAllArticles(stored);

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
      if (englishVoices.length > 0) setVoice(englishVoices[0]);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const exists = allArticles.find((a) => a.url === article.url);
    if (exists) return setArticle(exists);

    const { data } = await getSummary({ articleUrl: article.url });
    if (data?.summary) {
      const newArticle = { ...article, summary: data.summary };
      const updated = [newArticle, ...allArticles];
      setArticle(newArticle);
      setAllArticles(updated);
      localStorage.setItem("articles", JSON.stringify(updated));
    }
  };

  const handleCopy = (url) => {
    setCopied(url);
    navigator.clipboard.writeText(url);
    setTimeout(() => setCopied(""), 3000);
  };

  const handleDelete = (url) => {
    const updatedArticles = allArticles.filter((item) => item.url !== url);
    setAllArticles(updatedArticles);
    localStorage.setItem("articles", JSON.stringify(updatedArticles));
    if (article.url === url) setArticle({ url: "", summary: "" });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Article Summary", 10, 10);
    const lines = doc.splitTextToSize(article.summary, 180);
    doc.text(lines, 10, 20);
    doc.save("summary.pdf");
  };

  const handleRead = () => {
    if (!article.summary || !voice) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(article.summary);
    utterance.voice = voice;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
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

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      <div className="flex flex-col w-full gap-2">
        <form className="relative flex justify-center items-center" onSubmit={handleSubmit}>
          <img src={linkIcon} alt="link-icon" className="absolute left-0 my-2 ml-3 w-5" />
          <input
            type="url"
            placeholder="Paste the article link"
            value={article.url}
            onChange={(e) => setArticle({ ...article, url: e.target.value })}
            required
            className="url_input peer"
          />
          <button type="submit" className="submit_btn">
            <p>↵</p>
          </button>
        </form>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {allArticles.slice().reverse().map((item, index) => (
            <div key={index} className="link_card relative" onClick={() => setArticle(item)}>
              <div
                className="copy_btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.url);
                }}
              >
                <img
                  src={copied === item.url ? tick : copy}
                  alt="copy-icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-sm truncate">
                {item.url}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.url);
                }}
                className="absolute top-1 right-2 text-red-500 text-xl hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="my-10 max-w-full flex flex-col justify-center items-center gap-4">
        {isFetching ? (
          <img src={loader} alt="loader" className="w-20 h-20 object-contain" />
        ) : error ? (
          <p className="font-inter font-bold text-black text-center">
            Something went wrong...
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
                  <p className="font-inter font-medium text-sm text-gray-700">{article.summary}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  📄 Download as PDF
                </button>

                {!isSpeaking && (
                  <button
                    onClick={handleRead}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    🔊 Read Summary
                  </button>
                )}

                {isSpeaking && !isPaused && (
                  <button
                    onClick={handlePause}
                    className="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600"
                  >
                    ⏸️ Pause
                  </button>
                )}

                {isPaused && (
                  <button
                    onClick={handleResume}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                  >
                    ▶️ Resume
                  </button>
                )}

                {isSpeaking && (
                  <button
                    onClick={handleStop}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    ⛔ Stop
                  </button>
                )}
              </div>

              <div className="mt-4 w-full">
                <label htmlFor="volume" className="text-gray-700">
                  🔈 Volume: {Math.round(volume * 100)}%
                </label>
                <input
                  id="volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full mt-2"
                />
              </div>
            </>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
