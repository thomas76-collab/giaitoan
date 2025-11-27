import React, { useState, useEffect, useRef } from 'react';
import { solveMathProblem } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const App: React.FC = () => {
    const [currentMode, setCurrentMode] = useState<'image' | 'pdf' | 'text'>('image');
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [inputText, setInputText] = useState<string>('');
    const [solution, setSolution] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [toast, setToast] = useState<string>('');

    const fileInputImgRef = useRef<HTMLInputElement>(null);
    const fileInputPdfRef = useRef<HTMLInputElement>(null);
    const outputSectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);
    
    useEffect(() => {
        if (solution && outputSectionRef.current) {
            outputSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [solution]);


    const switchTab = (mode: 'image' | 'pdf' | 'text') => {
        setCurrentMode(mode);
        clearInput();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCurrentFile(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setCurrentFile(e.dataTransfer.files[0]);
        }
    };
    
    const clearInput = () => {
        setCurrentFile(null);
        setInputText('');
        setSolution('');
        if (fileInputImgRef.current) fileInputImgRef.current.value = '';
        if (fileInputPdfRef.current) fileInputPdfRef.current.value = '';
    };

    const loadExample = (type: string) => {
        const examples = {
            quadratic: "Giải phương trình x^2 - 5x + 6 = 0",
            derivative: "Tính đạo hàm của hàm số y = (2x+1)/(x-1)",
            geometry: "Cho hình chóp S.ABCD có đáy ABCD là hình vuông cạnh a, SA vuông góc với mặt phẳng (ABCD) và SA = a. Tính thể tích khối chóp S.ABCD.",
            trig: "Giải phương trình lượng giác: 2sin(x) - 1 = 0"
        };
        setInputText(examples[type as keyof typeof examples] || '');
    };

    const solveProblem = async () => {
        let input: File | string | null = null;
        if (currentMode === 'text') {
            if (!inputText.trim()) {
                setToast("Vui lòng nhập đề bài!");
                return;
            }
            input = inputText;
        } else {
            if (!currentFile) {
                setToast("Vui lòng tải lên một file!");
                return;
            }
            input = currentFile;
        }

        setIsLoading(true);
        setSolution('');
        
        const result = await solveMathProblem(input);
        
        setSolution(result);
        setIsLoading(false);
    };

    const copySolution = () => {
        if(outputSectionRef.current) {
            navigator.clipboard.writeText(outputSectionRef.current.innerText);
            setToast("Đã sao chép lời giải!");
        }
    }

    const resetApp = () => {
        clearInput();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        document.body.classList.toggle('dark-mode');
    }

    return (
        <>
            <header>
                <div className="logo">
                    <i className="fa-solid fa-cube"></i>
                    <span>Trợ lý toán thầy Trần Hoài Thanh</span>
                </div>
                <div className="header-controls">
                    <button id="theme-toggle" title="Chế độ tối" onClick={toggleTheme}>
                        <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                    </button>
                    <button id="help-btn" title="Hướng dẫn" onClick={() => setToast("Tải ảnh hoặc nhập đề bài để nhận lời giải!")}>
                        <i className="fa-solid fa-circle-question"></i>
                    </button>
                </div>
            </header>

            <main>
                <section className="card">
                    <h2><i className="fa-solid fa-pen-to-square"></i> Nhập bài toán</h2>
                    <div className="input-tabs">
                        <button className={`tab-btn ${currentMode === 'image' ? 'active' : ''}`} onClick={() => switchTab('image')}><i className="fa-solid fa-image"></i> Ảnh chụp</button>
                        <button className={`tab-btn ${currentMode === 'pdf' ? 'active' : ''}`} onClick={() => switchTab('pdf')}><i className="fa-solid fa-file-pdf"></i> File PDF</button>
                        <button className={`tab-btn ${currentMode === 'text' ? 'active' : ''}`} onClick={() => switchTab('text')}><i className="fa-solid fa-keyboard"></i> Nhập văn bản</button>
                    </div>

                    <div id="input-image" className={`input-area ${currentMode === 'image' ? 'active' : ''}`}>
                        <div className="drop-zone" id="drop-zone-img" onClick={() => fileInputImgRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            <p>Kéo thả ảnh vào đây hoặc <span className="browse-btn">chọn file</span></p>
                            <p style={{fontSize: '0.8rem', color: 'var(--text-light)'}}>Hỗ trợ: .jpg, .png, .jpeg</p>
                            <input type="file" id="file-input-img" accept="image/*" ref={fileInputImgRef} onChange={handleFileChange} style={{display: 'none'}}/>
                        </div>
                    </div>

                    <div id="input-pdf" className={`input-area ${currentMode === 'pdf' ? 'active' : ''}`}>
                         <div className="drop-zone" id="drop-zone-pdf" onClick={() => fileInputPdfRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
                            <i className="fa-solid fa-file-pdf"></i>
                            <p>Kéo thả PDF vào đây hoặc <span className="browse-btn">chọn file</span></p>
                            <input type="file" id="file-input-pdf" accept=".pdf" ref={fileInputPdfRef} onChange={handleFileChange} style={{display: 'none'}}/>
                        </div>
                    </div>

                    <div id="input-text" className={`input-area ${currentMode === 'text' ? 'active' : ''}`}>
                        <textarea id="text-input-field" placeholder="Nhập đề bài toán của bạn tại đây... Ví dụ: Giải phương trình x^2 - 5x + 6 = 0" value={inputText} onChange={(e) => setInputText(e.target.value)}></textarea>
                        <div style={{marginTop: '1rem'}}>
                            <p style={{fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-light)'}}>Thử các ví dụ mẫu:</p>
                            <div className="examples-grid">
                                <div className="example-chip" onClick={() => loadExample('quadratic')}>Phương trình bậc 2</div>
                                <div className="example-chip" onClick={() => loadExample('derivative')}>Đạo hàm</div>
                                <div className="example-chip" onClick={() => loadExample('geometry')}>Hình học không gian</div>
                                <div className="example-chip" onClick={() => loadExample('trig')}>Lượng giác</div>
                            </div>
                        </div>
                    </div>

                    {currentFile && (
                        <div id="preview-container" className="preview-container" style={{display: 'flex'}}>
                            <div className="preview-content">
                                {currentFile.type.startsWith('image/') ? (
                                    <img id="preview-image" src={URL.createObjectURL(currentFile)} alt="Preview" className="preview-img"/>
                                ) : (
                                    <i id="preview-icon" className="fa-solid fa-file-lines" style={{fontSize: '2rem', color: 'var(--primary)'}}></i>
                                )}
                                <div className="file-info">
                                    <h4 id="file-name">{currentFile.name}</h4>
                                    <span id="file-size">{(currentFile.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            </div>
                            <button className="remove-btn" onClick={clearInput}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    )}

                    <button id="solve-btn" className="solve-btn" onClick={solveProblem} disabled={isLoading}>
                        {isLoading ? (
                            <>
                               <div className="spinner" style={{display: 'block'}}></div>
                               <span className="btn-text">Đang xử lý...</span>
                            </>
                        ) : (
                            <span className="btn-text">🚀 Giải bài toán</span>
                        )}
                    </button>
                </section>
                
                {solution && (
                    <section id="output-section" className="card" ref={outputSectionRef}>
                        <div className="solution-header">
                            <h2><i className="fa-solid fa-wand-magic-sparkles"></i> Lời giải chi tiết</h2>
                        </div>

                         <div id="solution-body" className="prose prose-sm sm:prose-base max-w-none dark:prose-invert prose-p:leading-relaxed">
                             <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {solution}
                             </ReactMarkdown>
                         </div>


                        <div className="action-buttons">
                            <button className="secondary-btn" onClick={copySolution}><i className="fa-regular fa-copy"></i> Sao chép lời giải</button>
                            <button className="secondary-btn" onClick={() => setToast("Tính năng đang phát triển!")}><i className="fa-solid fa-download"></i> Xuất PDF</button>
                            <button className="secondary-btn" onClick={resetApp}><i className="fa-solid fa-rotate-right"></i> Giải bài khác</button>
                        </div>
                    </section>
                )}
            </main>

            <div className="disclaimer">
                <p>&copy; 2024 Trợ lý toán thầy Trần Hoài Thanh. Powered by Google Gemini.</p>
            </div>
            
            <div id="toast" className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
        </>
    );
};

export default App;