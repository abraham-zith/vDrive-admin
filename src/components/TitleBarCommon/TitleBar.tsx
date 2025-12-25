import React from "react";

interface TitleBarProps {
  title: string;
  description?: string;
  extraContent?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const TitleBar: React.FC<TitleBarProps> = ({
  icon,
  title,
  extraContent,
  children,
  description,
  className,
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-2">
      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-300">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl text-blue-600">{icon}</div>}

          <div>
            <p className="font-bold text-2xl">{title}</p>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">{extraContent}</div>
      </div>
      <div
        className={
          className?.length
            ? className
            : "w-full h-full relative overflow-hidden"
        }
      >
        {children}
      </div>
    </div>
  );
};

export default TitleBar;
