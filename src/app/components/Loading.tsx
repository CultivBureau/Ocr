"use client";

import React from 'react';

interface LoadingProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  fullScreen = true, 
  size = 'md',
  message
}) => {
  const sizeMultiplier = {
    sm: 0.7,
    md: 1,
    lg: 1.3
  };

  const scale = sizeMultiplier[size];

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex flex-col items-center justify-center gap-8">
          {/* Typewriter Animation */}
          <div 
            className="typewriter relative"
            style={{ 
              transform: `scale(${scale})`,
              animation: 'bounce05 3s linear infinite'
            }}
          >
            {/* Slide */}
            <div 
              className="slide w-[92px] h-5 rounded-[3px] ml-3.5 translate-x-3.5 bg-gradient-to-b from-[#5C86FF] to-[#275EFE]"
              style={{ animation: 'slide05 3s ease infinite' }}
            >
              <i className="block absolute right-full w-1.5 h-1 top-1 bg-[#FBC56C]">
                <span className="absolute right-full top-[-2px] w-1 rounded-sm h-3.5 bg-[#FBC56C]"></span>
              </i>
              <span className="absolute w-0.5 h-2 top-1.5 left-full bg-[#FBC56C]"></span>
              <span className="absolute left-[94px] top-[3px] h-3.5 w-1.5 rounded-[3px] bg-[#FBC56C]"></span>
            </div>

            {/* Paper */}
            <div 
              className="paper absolute left-6 top-[-26px] w-10 h-[46px] rounded-[5px] bg-[#EEF0FD] translate-y-[46px]"
              style={{ animation: 'paper05 3s linear infinite' }}
            >
              <span className="absolute left-1.5 right-1.5 top-[7px] rounded-sm h-1 bg-[#D3D4EC] scale-y-[0.8] shadow-[0_12px_0_#D3D4EC,0_24px_0_#D3D4EC,0_36px_0_#D3D4EC]"></span>
            </div>

            {/* Keyboard */}
            <div className="keyboard w-[120px] h-14 mt-[-10px] z-[1] relative">
              <span className="absolute top-0 left-0 right-0 bottom-0 rounded-[7px] bg-gradient-to-br from-[#5C86FF] to-[#275EFE] origin-[50%_100%]" style={{ transform: 'perspective(10px) rotateX(2deg)' }}></span>
              <span 
                className="keys absolute left-0.5 top-[25px] w-[11px] h-1 rounded-sm bg-white"
                style={{ 
                  animation: 'keyboard05 3s linear infinite',
                  boxShadow: '15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff'
                }}
              ></span>
            </div>
          </div>

          {/* Loading text */}
          {message && (
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-700">{message}</p>
            </div>
          )}
        </div>

        {/* Keyframes */}
        <style jsx>{`
          @keyframes bounce05 {
            85%, 92%, 100% {
              transform: translateY(0) scale(${scale});
            }
            89% {
              transform: translateY(-4px) scale(${scale});
            }
            95% {
              transform: translateY(2px) scale(${scale});
            }
          }

          @keyframes slide05 {
            5% {
              transform: translateX(14px);
            }
            15%, 30% {
              transform: translateX(6px);
            }
            40%, 55% {
              transform: translateX(0);
            }
            65%, 70% {
              transform: translateX(-4px);
            }
            80%, 89% {
              transform: translateX(-12px);
            }
            100% {
              transform: translateX(14px);
            }
          }

          @keyframes paper05 {
            5% {
              transform: translateY(46px);
            }
            20%, 30% {
              transform: translateY(34px);
            }
            40%, 55% {
              transform: translateY(22px);
            }
            65%, 70% {
              transform: translateY(10px);
            }
            80%, 85% {
              transform: translateY(0);
            }
            92%, 100% {
              transform: translateY(46px);
            }
          }

          @keyframes keyboard05 {
            5%, 12%, 21%, 30%, 39%, 48%, 57%, 66%, 75%, 84% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            9% {
              box-shadow: 15px 2px 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            18% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 2px 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            27% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 12px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            36% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 12px 0 #fff, 60px 12px 0 #fff, 68px 12px 0 #fff, 83px 10px 0 #fff;
            }
            45% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 2px 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            54% {
              box-shadow: 15px 0 0 #fff, 30px 2px 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            63% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 12px 0 #fff;
            }
            72% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 2px 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
            81% {
              box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 12px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
            }
          }
        `}</style>
      </div>
    );
  }

  // Inline loading (not fullscreen)
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div 
        className="typewriter relative"
        style={{ 
          transform: `scale(${scale})`,
          animation: 'bounce05 3s linear infinite'
        }}
      >
        {/* Slide */}
        <div 
          className="slide w-[92px] h-5 rounded-[3px] ml-3.5 translate-x-3.5 bg-gradient-to-b from-[#5C86FF] to-[#275EFE]"
          style={{ animation: 'slide05 3s ease infinite' }}
        >
          <i className="block absolute right-full w-1.5 h-1 top-1 bg-[#FBC56C]">
            <span className="absolute right-full top-[-2px] w-1 rounded-sm h-3.5 bg-[#FBC56C]"></span>
          </i>
          <span className="absolute w-0.5 h-2 top-1.5 left-full bg-[#FBC56C]"></span>
          <span className="absolute left-[94px] top-[3px] h-3.5 w-1.5 rounded-[3px] bg-[#FBC56C]"></span>
        </div>

        {/* Paper */}
        <div 
          className="paper absolute left-6 top-[-26px] w-10 h-[46px] rounded-[5px] bg-[#EEF0FD] translate-y-[46px]"
          style={{ animation: 'paper05 3s linear infinite' }}
        >
          <span className="absolute left-1.5 right-1.5 top-[7px] rounded-sm h-1 bg-[#D3D4EC] scale-y-[0.8] shadow-[0_12px_0_#D3D4EC,0_24px_0_#D3D4EC,0_36px_0_#D3D4EC]"></span>
        </div>

        {/* Keyboard */}
        <div className="keyboard w-[120px] h-14 mt-[-10px] z-[1] relative">
          <span className="absolute top-0 left-0 right-0 bottom-0 rounded-[7px] bg-gradient-to-br from-[#5C86FF] to-[#275EFE] origin-[50%_100%]" style={{ transform: 'perspective(10px) rotateX(2deg)' }}></span>
          <span 
            className="keys absolute left-0.5 top-[25px] w-[11px] h-1 rounded-sm bg-white"
            style={{ 
              animation: 'keyboard05 3s linear infinite',
              boxShadow: '15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff'
            }}
          ></span>
        </div>
      </div>

      {message && <p className="text-sm font-semibold text-gray-600">{message}</p>}

      <style jsx>{`
        @keyframes bounce05 {
          85%, 92%, 100% {
            transform: translateY(0) scale(${scale});
          }
          89% {
            transform: translateY(-4px) scale(${scale});
          }
          95% {
            transform: translateY(2px) scale(${scale});
          }
        }

        @keyframes slide05 {
          5% { transform: translateX(14px); }
          15%, 30% { transform: translateX(6px); }
          40%, 55% { transform: translateX(0); }
          65%, 70% { transform: translateX(-4px); }
          80%, 89% { transform: translateX(-12px); }
          100% { transform: translateX(14px); }
        }

        @keyframes paper05 {
          5% { transform: translateY(46px); }
          20%, 30% { transform: translateY(34px); }
          40%, 55% { transform: translateY(22px); }
          65%, 70% { transform: translateY(10px); }
          80%, 85% { transform: translateY(0); }
          92%, 100% { transform: translateY(46px); }
        }

        @keyframes keyboard05 {
          5%, 12%, 21%, 30%, 39%, 48%, 57%, 66%, 75%, 84% {
            box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff;
          }
          9% { box-shadow: 15px 2px 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          18% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 2px 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          27% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 12px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          36% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 12px 0 #fff, 60px 12px 0 #fff, 68px 12px 0 #fff, 83px 10px 0 #fff; }
          45% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 2px 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          54% { box-shadow: 15px 0 0 #fff, 30px 2px 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          63% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 12px 0 #fff; }
          72% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 2px 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 10px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
          81% { box-shadow: 15px 0 0 #fff, 30px 0 0 #fff, 45px 0 0 #fff, 60px 0 0 #fff, 75px 0 0 #fff, 90px 0 0 #fff, 22px 10px 0 #fff, 37px 12px 0 #fff, 52px 10px 0 #fff, 60px 10px 0 #fff, 68px 10px 0 #fff, 83px 10px 0 #fff; }
        }
      `}</style>
    </div>
  );
};

export default Loading;