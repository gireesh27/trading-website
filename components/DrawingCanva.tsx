"use client";

import React, { useState } from "react";
import { Stage, Layer, Line, Rect, Arrow, Text, Circle } from "react-konva";
import { Button } from "./ui/button";
import { Undo, Redo, Trash2 } from "lucide-react";

type Tool =
  | "line"
  | "rectangle"
  | "arrow"
  | "text"
  | "eraser"
  | "ray"
  | "extended-line"
  | "brush";

interface Point {
  x: number;
  y: number;
}
interface Shape {
  type: Tool;
  start: Point;
  end: Point;
  text?: string;
  points?: number[];
}
type Candle = {
  x: number; // pixel x
  y: number; // pixel y (mapped from close price)
  close: number;
  time?: number;
  open?: number;
  high?: number;
  low?: number;
};

interface DrawingCanvasProps {
  width: number;
  height: number;
  drawingTool: Tool | null;
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  history: Shape[][];
  setHistory: React.Dispatch<React.SetStateAction<Shape[][]>>;
  redoStack: Shape[][];
  setRedoStack: React.Dispatch<React.SetStateAction<Shape[][]>>;
  candles?: Candle[];
}

const DrawingCanvas = ({
  width,
  height,
  drawingTool,
  shapes,
  candles,
  setShapes,
  history,
  setHistory,
  redoStack,
  setRedoStack,
}: DrawingCanvasProps) => {
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);
  const [eraserBox, setEraserBox] = useState<Shape | null>(null);
  const [nearest, setNearest] = useState<Candle | null>(null);

  function findExactCandle(
    x: number,
    candles: Candle[],
    chartWidth: number
  ): Candle | null {
    if (!candles || candles.length === 0) return null;

    const candleSpacing = chartWidth / candles.length;

    for (let i = 0; i < candles.length; i++) {
      const candleX = i * candleSpacing;
      const leftBound = candleX - candleSpacing / 2;
      const rightBound = candleX + candleSpacing / 2;

      if (x >= leftBound && x <= rightBound) {
        return { ...candles[i], x: candleX, y: candles[i].y }; // assumes y is already calculated
      }
    }

    return null;
  }

  function getYFromPrice(
    price: number,
    candles: Candle[],
    chartHeight: number
  ): number {
    const prices = candles.flatMap((c) => {
      if (c.high != null && c.low != null) {
        return [c.high, c.low];
      }
      if (c.close != null) {
        return [c.close]; // fallback
      }
      return [];
    });

    if (prices.length < 2) return chartHeight / 2; // prevent division by 0

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const pxPerUnit = chartHeight / (maxPrice - minPrice);

    return chartHeight - (price - minPrice) * pxPerUnit;
  }

  const handleMouseDown = (e: any) => {
    if (!drawingTool || !candles) return;

    let pos = e.target.getStage().getPointerPosition();
    const snap = findExactCandle(pos.x, candles, width);

    if (snap) {
      pos = { x: snap.x, y: snap.y }; // Use both X and Y
    }

    if (drawingTool === "eraser") {
      setEraserBox({ type: "eraser", start: pos, end: pos });
      return;
    }

    if (drawingTool === "text") {
      setTextPos(pos);
      setTextInput("");
      return;
    }

    if (drawingTool === "brush") {
      setCurrentShape({
        type: "brush",
        start: pos,
        end: pos,
        points: [pos.x, pos.y],
      });
      return;
    }

    setCurrentShape({ type: drawingTool, start: pos, end: pos });
  };

  const handleMouseMove = (e: any) => {
    const pos = e.target.getStage().getPointerPosition();

    const exact = findExactCandle(pos.x, candles!, width);
    if (exact) {
      setNearest(exact); // use exact with .x and .y

      if (drawingTool !== "brush") {
        pos.x = exact.x;
        pos.y = exact.y; // use precomputed y
      }
    } else {
      setNearest(null);
    }

    if (drawingTool === "eraser" && eraserBox) {
      setEraserBox({ ...eraserBox, end: pos });
      return;
    }

    if (currentShape?.type === "brush" && currentShape.points) {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pos.x, pos.y],
      });
      return;
    }

    if (currentShape) {
      setCurrentShape({ ...currentShape, end: pos });
    }
  };

  const handleMouseUp = () => {
    if (drawingTool === "eraser" && eraserBox) {
      const x1 = Math.min(eraserBox.start.x, eraserBox.end.x);
      const x2 = Math.max(eraserBox.start.x, eraserBox.end.x);
      const y1 = Math.min(eraserBox.start.y, eraserBox.end.y);
      const y2 = Math.max(eraserBox.start.y, eraserBox.end.y);

      const filtered = shapes.filter((shape) => {
        const sx = Math.min(shape.start.x, shape.end.x);
        const ex = Math.max(shape.start.x, shape.end.x);
        const sy = Math.min(shape.start.y, shape.end.y);
        const ey = Math.max(shape.start.y, shape.end.y);
        return sx < x1 || ex > x2 || sy < y1 || ey > y2;
      });

      setHistory([...history, shapes]);
      setRedoStack([]);
      setShapes(filtered);
      setEraserBox(null);
      return;
    }

    if (currentShape) {
      setHistory([...history, shapes]);
      setRedoStack([]);
      setShapes([...shapes, currentShape]);
      setCurrentShape(null);
    }
  };

  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && textInput.trim() && textPos) {
      const newTextShape: Shape = {
        type: "text",
        start: textPos,
        end: textPos,
        text: textInput,
      };
      setHistory([...history, shapes]);
      setRedoStack([]);
      setShapes([...shapes, newTextShape]);
      setTextPos(null);
      setTextInput("");
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack([shapes, ...redoStack]);
    setShapes(prev);
    setHistory(history.slice(0, -1));
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory([...history, shapes]);
    setShapes(next);
    setRedoStack(redoStack.slice(1));
  };

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: drawingTool ? "auto" : "none",
        zIndex: 10,
      }}
    >
      {/* Controls */}
      {drawingTool && (
        <div className="absolute top-2 right-20 z-20 flex gap-2">
          <Button onClick={undo} size="icon" variant="outline" title="Undo">
            <Undo className="h-4 w-4" />
          </Button>
          <Button onClick={redo} size="icon" variant="outline" title="Redo">
            <Redo className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setHistory([...history, shapes]);
              setRedoStack([]);
              setShapes([]);
            }}
            size="icon"
            variant="outline"
            title="Clear All"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {textPos && (
        <input
          autoFocus
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleTextSubmit}
          placeholder="Type and press Enter"
          className="absolute z-50 px-2 py-1 text-sm bg-white text-black border rounded shadow"
          style={{
            top: textPos.y,
            left: textPos.x,
          }}
        />
      )}

      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          {[...shapes, ...(currentShape ? [currentShape] : [])].map(
            (shape, i) => {
              const { start, end, type } = shape;
              const key = `shape-${type}-${i}`;
              const points = (
                <>
                  <Circle
                    key={`start-${key}`}
                    x={start.x}
                    y={start.y}
                    radius={3}
                    fill="yellow"
                    stroke="black"
                    strokeWidth={0.5}
                  />
                  <Circle
                    key={`end-${key}`}
                    x={end.x}
                    y={end.y}
                    radius={3}
                    fill="yellow"
                    stroke="black"
                    strokeWidth={0.5}
                  />
                </>
              );

              switch (type) {
                case "line":
                  return (
                    <React.Fragment key={key}>
                      <Line
                        points={[start.x, start.y, end.x, end.y]}
                        stroke="yellow"
                        strokeWidth={2}
                      />
                      {points}
                    </React.Fragment>
                  );
                case "rectangle":
                  return (
                    <React.Fragment key={key}>
                      <Rect
                        x={Math.min(start.x, end.x)}
                        y={Math.min(start.y, end.y)}
                        width={Math.abs(end.x - start.x)}
                        height={Math.abs(end.y - start.y)}
                        stroke="yellow"
                        strokeWidth={2}
                      />
                      {points}
                    </React.Fragment>
                  );
                case "arrow":
                  return (
                    <React.Fragment key={key}>
                      <Arrow
                        points={[start.x, start.y, end.x, end.y]}
                        stroke="yellow"
                        fill="yellow"
                        strokeWidth={2}
                      />
                      {points}
                    </React.Fragment>
                  );
                case "ray": {
                  const dx = end.x - start.x;
                  const dy = end.y - start.y;
                  const factor = 10000;
                  return (
                    <React.Fragment key={key}>
                      <Line
                        points={[
                          start.x,
                          start.y,
                          start.x + dx * factor,
                          start.y + dy * factor,
                        ]}
                        stroke="yellow"
                        strokeWidth={2}
                      />
                      {points}
                    </React.Fragment>
                  );
                }
                case "extended-line": {
                  const dx = end.x - start.x;
                  const dy = end.y - start.y;
                  const factor = 10000;
                  return (
                    <React.Fragment key={key}>
                      <Line
                        points={[
                          start.x - dx * factor,
                          start.y - dy * factor,
                          end.x + dx * factor,
                          end.y + dy * factor,
                        ]}
                        stroke="yellow"
                        strokeWidth={2}
                      />
                      {points}
                    </React.Fragment>
                  );
                }
                case "brush":
                  return (
                    <Line
                      key={key}
                      points={shape.points ?? []}
                      stroke="yellow"
                      strokeWidth={2}
                      tension={0.5}
                      lineCap="round"
                      globalCompositeOperation="source-over"
                    />
                  );
                case "text":
                  return (
                    <Text
                      key={key}
                      text={shape.text ?? ""}
                      x={start.x}
                      y={start.y}
                      fontSize={14}
                      fill="yellow"
                      draggable
                    />
                  );
                default:
                  return null;
              }
            }
          )}

          {nearest && (
            <Circle
              x={nearest.x}
              y={nearest.y}
              radius={4}
              fill="white"
              opacity={0.7}
            />
          )}

          {eraserBox && (
            <Rect
              x={Math.min(eraserBox.start.x, eraserBox.end.x)}
              y={Math.min(eraserBox.start.y, eraserBox.end.y)}
              width={Math.abs(eraserBox.end.x - eraserBox.start.x)}
              height={Math.abs(eraserBox.end.y - eraserBox.start.y)}
              stroke="red"
              dash={[4, 4]}
              strokeWidth={1}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;
