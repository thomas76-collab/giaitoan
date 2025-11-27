
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface SolutionDisplayProps {
    solution: string;
}

const SolutionDisplay: React.FC<SolutionDisplayProps> = ({ solution }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 sm:p-6 rounded-lg border dark:border-gray-700">
            <div className="prose prose-sm sm:prose-base max-w-none dark:prose-invert 
                prose-h3:font-bold prose-h3:text-indigo-600 prose-h3:dark:text-indigo-400 prose-h3:border-b prose-h3:pb-2 prose-h3:mb-3
                prose-h3:border-gray-200 dark:prose-h3:border-gray-700
                prose-p:leading-relaxed
                prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:bg-gray-200 prose-code:dark:bg-gray-700 prose-code:rounded prose-code:px-1 prose-code:font-mono
            ">
                <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        // Custom renderer to style the final answer box
                        p: ({node, ...props}) => {
                           const text = node.children[0].type === 'text' ? node.children[0].value : '';
                           if(text.startsWith('Đáp án:')) {
                                return <p {...props} className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 rounded-lg p-4 font-bold text-green-800 dark:text-green-200" />
                           }
                           return <p {...props}/>
                        }
                    }}
                >
                    {solution}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export default SolutionDisplay;
