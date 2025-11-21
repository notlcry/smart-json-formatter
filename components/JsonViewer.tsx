import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { DiffNode } from '../services/jsonUtils';

interface JsonViewerProps {
    data: any;
    label?: string;
    diff?: DiffNode; // Optional diff data
}

interface JsonNodeProps {
    name?: string;
    value: any;
    isLast: boolean;
    depth: number;
    diff?: DiffNode; // Pass diff node down
}

const JsonNode: React.FC<JsonNodeProps> = ({ name, value, isLast, depth, diff }) => {
    const [expanded, setExpanded] = useState(true);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const isEmpty = isObject && Object.keys(value).length === 0;
    const openBracket = isArray ? '[' : '{';
    const closeBracket = isArray ? ']' : '}';

    // Determine styles based on diff type
    let diffClass = '';
    let diffMarker = null;

    if (diff) {
        if (diff.type === 'added') {
            diffClass = 'bg-green-100/50 text-green-800';
            diffMarker = <span className="text-green-600 mr-1">+</span>;
        } else if (diff.type === 'removed') {
            diffClass = 'bg-red-100/50 text-red-800';
            diffMarker = <span className="text-red-600 mr-1">-</span>;
        } else if (diff.type === 'updated' && !isObject) {
            diffClass = 'bg-yellow-100/50 text-yellow-800';
            diffMarker = <span className="text-yellow-600 mr-1">~</span>;
        }
    }

    const renderValue = (val: any) => {
        if (val === null) return <span className="text-rose-600">null</span>;
        if (typeof val === 'boolean') return <span className="text-rose-600">{val.toString()}</span>;
        if (typeof val === 'number') return <span className="text-sky-600">{val}</span>;
        if (typeof val === 'string') return <span className="text-emerald-600">"{val}"</span>;
        return <span className="text-zinc-500">{String(val)}</span>;
    };

    // Handle primitive updates specifically to show old -> new
    if (diff && diff.type === 'updated' && !isObject) {
        return (
            <div className={`font-mono text-xs leading-5 px-1 rounded ${diffClass}`}>
                <span style={{ paddingLeft: `${depth * 1.2}rem` }}>
                    {diffMarker}
                    {name && <span className="text-violet-600">"{name}"</span>}
                    {name && <span className="text-zinc-400">: </span>}
                    <span className="line-through text-red-400 mr-2">{String(diff.oldValue)}</span>
                    {renderValue(diff.value)}
                    {!isLast && <span className="text-zinc-400">,</span>}
                </span>
            </div>
        );
    }

    if (!isObject) {
        return (
            <div className={`font-mono text-xs leading-5 hover:bg-zinc-100 px-1 rounded ${diffClass}`}>
                <span style={{ paddingLeft: `${depth * 1.2}rem` }}>
                    {diffMarker}
                    {name && <span className="text-violet-600">"{name}"</span>}
                    {name && <span className="text-zinc-400">: </span>}
                    {renderValue(value)}
                    {!isLast && <span className="text-zinc-400">,</span>}
                </span>
            </div>
        );
    }

    if (isEmpty) {
        return (
            <div className={`font-mono text-xs leading-5 hover:bg-zinc-100 px-1 rounded ${diffClass}`}>
                <span style={{ paddingLeft: `${depth * 1.2}rem` }}>
                    {diffMarker}
                    {name && <span className="text-violet-600">"{name}"</span>}
                    {name && <span className="text-zinc-400">: </span>}
                    <span className="text-zinc-400">{openBracket}{closeBracket}</span>
                    {!isLast && <span className="text-zinc-400">,</span>}
                </span>
            </div>
        );
    }

    return (
        <div>
            <div
                className={`font-mono text-xs leading-5 hover:bg-zinc-100 px-1 rounded cursor-pointer flex items-center ${diffClass}`}
                onClick={handleToggle}
            >
                <span style={{ paddingLeft: `${depth * 1.2}rem` }} className="flex items-center">
                    {diffMarker}
                    <span className="mr-1 text-zinc-400">
                        {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </span>
                    {name && <span className="text-violet-600">"{name}"</span>}
                    {name && <span className="text-zinc-400">: </span>}
                    <span className="text-zinc-400">{openBracket}</span>
                    {!expanded && <span className="text-zinc-400 ml-1">... {closeBracket}</span>}
                    {!expanded && !isLast && <span className="text-zinc-400">,</span>}
                </span>
            </div>

            {expanded && (
                <div>
                    {diff?.children ? (
                        Object.keys(diff.children).map((key, index, arr) => {
                            const childDiff = diff.children![key];
                            return (
                                <JsonNode
                                    key={key}
                                    name={isArray ? undefined : key}
                                    value={childDiff.value}
                                    isLast={index === arr.length - 1}
                                    depth={depth + 1}
                                    diff={childDiff}
                                />
                            );
                        })
                    ) : (
                        Object.keys(value).map((key, index, arr) => (
                            <JsonNode
                                key={key}
                                name={isArray ? undefined : key}
                                value={value[key]}
                                isLast={index === arr.length - 1}
                                depth={depth + 1}
                                diff={diff?.children?.[key]}
                            />
                        ))
                    )}
                    <div className={`font-mono text-xs leading-5 hover:bg-zinc-100 px-1 rounded ${diffClass}`}>
                        <span style={{ paddingLeft: `${depth * 1.2}rem` }}>
                            <span className="text-zinc-400">{closeBracket}</span>
                            {!isLast && <span className="text-zinc-400">,</span>}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, label, diff }) => {
    return (
        <div className="flex flex-col h-full">
            {label && (
                <div className="flex justify-between items-center mb-2 px-1 flex-none">
                    <span className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
                </div>
            )}
            <div className="flex-1 overflow-auto bg-white p-2 rounded-lg border border-zinc-200">
                <JsonNode value={data} isLast={true} depth={0} diff={diff} />
            </div>
        </div>
    );
};
