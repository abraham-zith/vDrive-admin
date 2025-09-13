import React from "react";

interface TitleBarProps {
  title: string;
  description?: string;
  extraContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({
  title,
  extraContent,
  children,
  description,
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b border-gray-300">
        <div>
          <p className="font-bold text-2xl">{title}</p>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">{extraContent}</div>
      </div>
      <div className="w-full h-full relative overflow-hidden">{children}</div>
    </div>
  );
};

export default TitleBar;
