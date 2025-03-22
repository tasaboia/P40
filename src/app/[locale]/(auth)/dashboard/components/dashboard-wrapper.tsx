"use client";

import { useState, useRef, useEffect } from "react";
import * as UI from "@p40/components/ui/index";
import { useRouter } from "next/navigation";
import { DashboardTabs } from "@p40/common/constants";
import { usePathname } from "@p40/i18n/routing";

export default function DashboardWrapper({ children }) {
  const router = useRouter();
  const path = usePathname();
  const indexInicial = DashboardTabs.findIndex((tabs) =>
    tabs.route.includes(path.replace(/\//g, ""))
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(indexInicial);
  const [activeIndex, setActiveIndex] = useState(indexInicial);

  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const initialRender = useRef(true);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
      if (initialRender.current === false) {
        router.push(`${DashboardTabs[activeIndex].route}`);
      }
      initialRender.current = false;
    }
  }, [activeIndex, router]);

  return (
    <div
      className={`flex flex-col  w-full   ${
        isDarkMode ? "dark bg-[#0e0f11]" : ""
      }`}
    >
      <UI.Card
        className={`w-full max-w-[1200px] h-10 px-6 border-none shadow-none relative flex ${
          isDarkMode ? "bg-transparent" : ""
        }`}
      >
        <UI.CardContent className="p-0">
          <div className="relative">
            <div
              className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
              style={{
                ...hoverStyle,
                opacity: hoveredIndex !== null ? 1 : 0,
              }}
            />

            <div
              className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
              style={activeStyle}
            />

            <div className="relative flex space-x-[6px] items-center">
              {DashboardTabs.map((tab, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                    index === activeIndex
                      ? "text-[#0e0e10] dark:text-white"
                      : "text-[#0e0f1199] dark:text-[#ffffff99]"
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="text-sm font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap flex items-center justify-center h-full">
                    {tab.indexTitle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UI.CardContent>
      </UI.Card>

      <div>{children}</div>
    </div>
  );
}
