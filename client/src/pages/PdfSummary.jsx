import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const PdfSummary = () => {

  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("detailed");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const { getToken } = useAuth();

  const pollJobStatus = async (jobId, token) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(
          `/api/ai/job-status/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
       console.log(res.data.status )
        if (res.data.status === "completed") {
          setContent(res.data.content);
          setStatus("Completed");
          setLoading(false);
          clearInterval(interval);
        }

        if (res.data.status === "failed") {
          toast.error("PDF processing failed");
          setLoading(false);
          clearInterval(interval);
        }

        if (res.data.status === "active" || res.data.status === "waiting") {
          setStatus("Processing...");
        }

      } catch (err) {
        console.error(err);
        toast.error("Error checking job status");
        setLoading(false);
        clearInterval(interval);
      }
    }, 2000); // poll every 2 seconds
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      setLoading(true);
      setContent('');
      setStatus("Uploading...");

      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('mode', mode);
   
      const token = await getToken();

      const { data } = await axios.post(
        '/api/ai/pdf-summary',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
     console.log(data)
      if (data.success) {
        setStatus("Queued...");
        pollJobStatus(data.jobId, token);
      } else {
        toast.error(data.message);
        setLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
      setLoading(false);
    }
  };

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      {/* LEFT COLUMN */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>

        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>PDF Summary</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Upload PDF</p>

        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          accept='application/pdf'
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        <p className='text-xs text-gray-500 font-light mt-1'>
          Supports PDF files only (Max 5MB)
        </p>

        <p className='mt-4 text-sm font-medium'>Summary Mode</p>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className='w-full p-2 mt-2 text-sm rounded-md border border-gray-300 text-gray-600'
        >
          <option value="short">Short (5-7 lines)</option>
          <option value="detailed">Detailed Summary</option>
          <option value="bullet">Bullet Points</option>
          <option value="insights">Key Insights</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#009BB3] to-[#00DA83] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60'
        >
          {
            loading ?
              <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
              :
              <FileText className='w-5' />
          }
          {loading ? "Processing..." : "Generate Summary"}
        </button>

      </form>

      {/* RIGHT COLUMN */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>

        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Summary Results</h1>
        </div>

        {
          loading && !content ? (
            <div className='flex-1 flex justify-center items-center text-gray-500'>
              {status}
            </div>
          ) : !content ? (
            <div className='flex-1 flex justify-center items-center'>
              <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
                <FileText className='w-9 h-9' />
                <p>Upload a PDF and click "Generate Summary" to get started</p>
              </div>
            </div>
          ) : (
            <div className='mt-3 h-full overflow-y-scroll text-sm text-slate-600'>
              <div className='reset-tw'>
                <Markdown>{content}</Markdown>
              </div>
            </div>
          )
        }

      </div>

    </div>
  );
};

export default PdfSummary;
