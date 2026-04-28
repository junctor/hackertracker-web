import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import styles from "../styles/markdown.module.css";

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function Markdown({ content }: { content: string }) {
  return (
    <div className="prose dark:prose-invert prose-sm sm:prose-base md:prose-lg prose-headings:text-gray-100 prose-p:text-gray-200 prose-li:text-gray-200 prose-strong:text-gray-100 prose-a:text-indigo-300 hover:prose-a:text-indigo-200 prose-code:text-gray-100 prose-hr:border-gray-700 break-words antialiased md:max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (props) => (
            <a
              {...props}
              className="text-indigo-300 decoration-indigo-500/40 underline-offset-2 hover:text-indigo-200 hover:decoration-indigo-400 focus:ring-1 focus:ring-indigo-400 focus:outline-none"
            />
          ),

          code: ({ inline, className, children, ...other }: CodeProps) =>
            inline ? (
              <code {...other} className="rounded bg-gray-700 px-1 font-mono text-sm text-gray-100">
                {children}
              </code>
            ) : (
              <pre className="my-5 overflow-x-auto rounded-lg bg-gray-900 p-4 text-gray-100">
                <code className={className}>{children}</code>
              </pre>
            ),

          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-4 border-indigo-500 pl-4 text-gray-200 italic"
            />
          ),

          hr: (props) => <hr {...props} className="my-8 border-t border-gray-700" />,

          img: (props) => <img {...props} className="mx-auto my-5 rounded-md shadow-sm" />,

          div: (props) => <div {...props} className={styles.markdown} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
