'use client';

import { wwAPI } from '@/utils/api_instance';
import { CircularProgress, Typography } from '@mui/material';
import { ArrowLeft, LoaderCircleIcon, Mic, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const VoicePage = () => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playingResponseAudio, setPlayingResponseAudio] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const responseAudioRef = useRef(
    typeof Audio !== 'undefined' ? new Audio() : null
  );

  useEffect(() => {
    const createConversation = async () => {
      try {
        setLoading(true);
        const response = await wwAPI.post('/conversations/create', {
          userId: localStorage.getItem('userId'),
          companyId: localStorage.getItem('companyId'),
        });
        if (response.data && response.data.conversationId) {
          localStorage.setItem('conversationId', response.data.conversationId);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Failed to create conversation:', error);
      }
    };
    createConversation();
  }, []);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await wwAPI.post('/auth/verifyToken', {
          token: localStorage.getItem('token'),
        });
        setIsAuthVerified(true);
      } catch (error) {
        console.error('Token verification failed:', error);
        window.location.href = '/auth/login';
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    // Setup response audio ended event
    if (responseAudioRef.current) {
      responseAudioRef.current.onended = () => {
        setPlayingResponseAudio(false);
      };
    }

    return () => {
      if (responseAudioRef.current) {
        responseAudioRef.current.pause();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Reset audio chunks before starting a new recording
      audioChunksRef.current = [];
      setHasRecording(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/wav',
          });
          setAudioBlob(audioBlob);
          setHasRecording(true);
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop());
      };

      // Request data every 250ms to ensure we capture audio
      mediaRecorderRef.current.start(250);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const sendAudioMessage = async () => {
    if (!audioBlob) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('userId', localStorage.getItem('userId'));
      formData.append('companyId', localStorage.getItem('companyId'));

      // Add conversation ID if available
      const conversationId = localStorage.getItem('conversationId');
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }

      // Send to the voice endpoint that returns audio directly
      const response = await wwAPI.post('/conversations/voice', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
        data: {
          conversationId: localStorage.getItem('conversationId'),
          companyId: localStorage.getItem('companyId'),
        },
      });

      // Create audio URL from the response blob
      const audioUrl = URL.createObjectURL(response.data);
      responseAudioRef.current.src = audioUrl;

      // Auto-play the response
      responseAudioRef.current.play();
      setPlayingResponseAudio(true);
    } catch (error) {
      console.error('Error sending audio:', error);
    } finally {
      setAudioBlob(null);
      setLoading(false);
      setHasRecording(false);
    }
  };

  const handleRecordingAction = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return !isAuthVerified ? (
    <div className="h-screen w-screen flex items-center bg-slate-200 justify-center">
      <LoaderCircleIcon size={40} className="animate-spin text-black" />
    </div>
  ) : (
    <div className="flex h-screen justify-center items-center bg-slate-200">
      <div className="w-[650px] h-[85vh] bg-white flex flex-col shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 border border-black">
        <div className="p-4 flex h-20 items-center justify-start text-white bg-gradient-to-r from-gray-800 to-black border-b border-gray-600">
          <button
            onClick={handleBackToHome}
            className="text-white size-9 hover:bg-white/25 focus:bg-white/30 mr-3 cursor-pointer rounded-full flex items-center justify-center transition-all duration-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="ml-2">
            <Typography
              variant="h6"
              className="font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-sm"
            >
              WageWizard Voice Chat
            </Typography>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={handleRecordingAction}
            disabled={loading || playingResponseAudio}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              loading || playingResponseAudio
                ? 'bg-gradient-to-r from-gray-600 to-gray-800 opacity-70 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-800 to-black hover:shadow-lg active:scale-95'
            }`}
          >
            {loading ? (
              <CircularProgress size={40} className="text-white" />
            ) : recording ? (
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <div
                  className="w-3 h-3 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-3 h-3 bg-white rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            ) : (
              <Mic size={36} className="text-white" />
            )}
          </button>
          <p className="mt-4 text-sm text-gray-600 font-medium">
            {loading
              ? 'Processing...'
              : recording
                ? 'Click to stop recording'
                : 'Click to start recording'}
          </p>

          <button
            onClick={sendAudioMessage}
            disabled={!hasRecording || loading || playingResponseAudio}
            className={`mt-6 px-6 py-2 rounded-full flex items-center justify-center transition-all duration-300 ${
              !hasRecording || loading || playingResponseAudio
                ? 'bg-gray-400 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-800 to-black text-white hover:shadow-lg active:scale-95'
            }`}
          >
            <Send size={18} className="mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoicePage;
