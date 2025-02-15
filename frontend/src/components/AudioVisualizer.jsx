import React, { useEffect, useRef } from "react";

const AudioVisualizer = ({ isPlaying, audioUrl }) => {
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Initialize audio context
    audioContextRef.current = new (window.AudioContext ||
      window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    // Fetch and play audio
    fetch(audioUrl)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) =>
        audioContextRef.current.decodeAudioData(arrayBuffer)
      )
      .then((audioBuffer) => {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        source.start(0);

        // Animation function
        const animate = () => {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = canvas.width / dataArray.length;
          let x = 0;

          dataArray.forEach((value, i) => {
            const barHeight = (value / 255) * canvas.height;

            // Create gradient
            const gradient = ctx.createLinearGradient(
              0,
              canvas.height - barHeight,
              0,
              canvas.height
            );
            gradient.addColorStop(0, "rgba(147, 51, 234, 0.8)"); // Purple-500
            gradient.addColorStop(1, "rgba(79, 70, 229, 0.6)"); // Indigo-500

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
            x += barWidth;
          });

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
      });

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying, audioUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 rounded-lg"
      width={300}
      height={64}
    />
  );
};

export default AudioVisualizer;
