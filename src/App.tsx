import React, {ReactEventHandler, useEffect, useRef, useState} from 'react';
import './App.css';
import {Button, Form, Input, message, Alert} from 'antd/es';
import ReactDOM from "react-dom/client";

const layout = {
    labelCol: {span: 8},
    wrapperCol: {span: 16},
};

const tailLayout = {
    wrapperCol: {offset: 8, span: 16},
};


const AMINO_ACID_COLORS: Record<string, string> = {
    A: '#67E4A6',
    R: '#BB99FF',
    N: '#80BFFF',
    D: '#FC9CAC',
    C: '#FFEA00',
    E: '#FC9CAC',
    Q: '#80BFFF',
    G: '#C4C4C4',
    H: '#80BFFF',
    I: '#67E4A6',
    L: '#67E4A6',
    K: '#BB99FF',
    M: '#67E4A6',
    F: '#67E4A6',
    P: '#67E4A6',
    S: '#80BFFF',
    T: '#80BFFF',
    W: '#67E4A6',
    Y: '#67E4A6',
    V: '#67E4A6',
    '-': '',
};

interface Alignment {
    sequence1: string,
    sequence2: string
}

function App() {
    const [form] = Form.useForm();
    const [alignment, setAlignment] = useState<Alignment | null>(null);
    const [error, setError] = useState<string | null>(null);
    const seq1Ref = useRef<HTMLDivElement>(null);
    const seq2Ref = useRef<HTMLDivElement>(null);
    const [messageApi, contextHolder] = message.useMessage();


    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const handleMouseUp = (e: MouseEvent) => {
            if (e.target && e.target instanceof Element && e.target.classList.contains('amino-acid')) {
                const selection = window.getSelection();
                const selectedText = selection?.toString().trim();

                if (selectedText && selectedText.length > 0) {
                    navigator.clipboard.writeText(selectedText).then(() => {
                        success();
                    }).catch(err => {
                        console.error('Не удалось скопировать автоматически:', err);
                    });

                    timeoutId = setTimeout(() => {
                        selection?.removeAllRanges();
                    }, 200);
                }
            }
        };

        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            clearTimeout(timeoutId);
        };
    }, []);

    const onFinish = (values: Alignment) => {
        const {sequence1, sequence2} = values;

        if (sequence1.length !== sequence2.length) {
            setError('Длины последовательностей должны быть одинаковыми');
            setAlignment(null);
            return;
        }

        setError(null);
        setAlignment({
            sequence1: sequence1.toUpperCase(),
            sequence2: sequence2.toUpperCase()
        });
    };

    const success = () => {
        messageApi.open({
            type: 'success',
            content: 'Последовательность скопирована',
            duration: 1,
        });
    };

    const renderSequence = (sequence: string, compareWith?: string, ref?: React.RefObject<HTMLDivElement | null>) => {
        return (
            <div
                 ref={ref}
                 className="sequence-container"
                 style={{ userSelect: 'text' }}>
                {sequence.split('').map((char, index) => {
                    const backgroundColor = AMINO_ACID_COLORS[char] || '#ffffff';
                    let style: React.CSSProperties = {
                        display: 'inline-block',
                        padding: '2px 4px',
                        margin: '1px',
                        borderRadius: '3px',
                        backgroundColor,
                        color: '#000',
                        fontWeight: 'bold',
                    };

                    if (compareWith && char !== compareWith[index]) {
                        style = {
                            ...style,
                            backgroundColor: '#ffcccc',
                        };
                    }

                    return (
                        <span key={index}
                              style={style}
                              className="amino-acid"
                              data-char={char}
                        >
              {char}
            </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="App">
            {contextHolder}
            <Form
                {...layout}
                form={form}
                name="SEQUENCE_FORM"
                onFinish={onFinish}
                className="sequence-form"
            >
                <Form.Item
                    name="sequence1"
                    label="Последовательность 1"
                    rules={[
                        {required: true, message: 'Пожалуйста, введите последовательность'},
                        {
                            pattern: /^[ARNDCEQGHILKMFPSTWYV-]+$/i,
                            message: 'Только латинские буквы аминокислот или символ -'
                        }
                    ]}
                >
                    <Input placeholder="Например: VLSPADKTNIKASWEKIGSHG"/>
                </Form.Item>
                <Form.Item
                    name="sequence2"
                    label="Последовательность 2"
                    rules={[
                        {required: true, message: 'Пожалуйста, введите последовательность'},
                        {
                            pattern: /^[ARNDCEQGHILKMFPSTWYV-]+$/i,
                            message: 'Только латинские буквы аминокислот или символ -'
                        }
                    ]}
                >
                    <Input placeholder="Например: GGGGGGGGGGGGGGGGGGGG"/>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button type="primary" htmlType="submit">
                        Визуализировать выравнивание
                    </Button>
                </Form.Item>
            </Form>

            {error && (
                <Alert message={error} type="error" showIcon style={{marginBottom: 20}}/>
            )}

            {alignment && (
                <div className="alignment-result">
                    <h3>Результат выравнивания:</h3>
                    <div className="alignment-sequences">
                        {renderSequence(alignment.sequence1, undefined, seq1Ref)}
                        {renderSequence(alignment.sequence2, alignment.sequence1, seq2Ref)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
