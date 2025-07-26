"use client";

import React, { useState } from "react";
import { Stage, Layer, Line, Rect, Arrow, Text } from "react-konva";
import { Button } from "./ui/button";
import { Undo, Redo } from "lucide-react";

type Tool = "line" | "rectangle" | "arrow" | "text";

interface Point {
  x: number;
  y: number;
}
interface Shape {
  type: Tool;
  start: Point;
  end: Point;
  text?: string; // ✅ must be here!
}

interface DrawingCanvasProps {
  width: number;
  height: number;
  drawingTool: Tool | null;
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  history: Shape[][];
  setHistory: React.Dispatch<React.SetStateAction<Shape[][]>>;
  redoStack: Shape[][]; // ✅ Add this line
  setRedoStack: React.Dispatch<React.SetStateAction<Shape[][]>>;
}

const DrawingCanvas = ({
  width,
  height,
  drawingTool,
  shapes,
  setShapes,
  history,
  setHistory,
  redoStack,
  setRedoStack,
}: DrawingCanvasProps) => {
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);
  const newTextShape: Shape = {
    type: "text",
    start: textPos as Point,
    end: textPos as Point,
    text: textInput.trim(),
  };
  const handleMouseDown = (e: any) => {
    if (!drawingTool) return;
    const pos = e.target.getStage().getPointerPosition();

    if (drawingTool === "text") {
      setTextPos(pos);
      setTextInput("");
      return;
    }

    setCurrentShape({ type: drawingTool, start: pos, end: pos });
  };

  const handleMouseMove = (e: any) => {
    if (!currentShape) return;
    const pos = e.target.getStage().getPointerPosition();
    setCurrentShape({ ...currentShape, end: pos });
  };

  const handleMouseUp = () => {
    if (currentShape) {
      const newShapes = [...shapes, currentShape];
      setHistory([...history, shapes]);
      setRedoStack([]);
      setShapes(newShapes);
      setCurrentShape(null);
    }
  };

  const undo = () => {
    if (history.length === 0) return;

    const prevShapes = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setRedoStack([shapes, ...redoStack]); // Push current into redo stack
    setShapes(prevShapes); // Restore last shape state
    setHistory(newHistory); // Trim history
  };

  const redo = () => {
    if (redoStack.length === 0) return;

    const nextShapes = redoStack[0];
    const newRedoStack = redoStack.slice(1);

    setHistory([...history, shapes]); // Push current to history
    setShapes(nextShapes); // Apply next redo
    setRedoStack(newRedoStack); // Remove the top redo item
  };
  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && textInput.trim() && textPos) {
      const newTextShape: Shape = {
        type: "text",
        start: textPos,
        end: textPos,
        text: textInput,
      };
      setShapes([...shapes, newTextShape]);
      setHistory([...history, shapes]);
      setRedoStack([]);
      setTextPos(null);
      setTextInput("");
    }
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
      {/* ✅ Undo / Redo controls shown only when drawing */}
      {drawingTool && (
        <div className="absolute top-2 right-20 z-20 flex gap-2">
          {/* ✅ Undo */}
          <Button
            onClick={undo}
            size="icon"
            variant="outline"
            title="Undo"
            className="text-gray-200"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            onClick={redo}
            size="icon"
            variant="outline"
            title="Redo"
            className="text-gray-200"
          >
            <Redo className="h-4 w-4" />
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
              switch (type) {
                case "line":
                  return (
                    <Line
                      key={i}
                      points={[start.x, start.y, end.x, end.y]}
                      stroke="yellow"
                      strokeWidth={2}
                    />
                  );
                case "rectangle":
                  return (
                    <Rect
                      key={i}
                      x={Math.min(start.x, end.x)}
                      y={Math.min(start.y, end.y)}
                      width={Math.abs(end.x - start.x)}
                      height={Math.abs(end.y - start.y)}
                      stroke="yellow"
                      strokeWidth={2}
                    />
                  );
                case "arrow":
                  return (
                    <Arrow
                      key={i}
                      points={[start.x, start.y, end.x, end.y]}
                      stroke="yellow"
                      fill="yellow"
                      strokeWidth={2}
                    />
                  );
                
                case "text":
                  return (
                    <Text
                      key={i}
                      text={shape.text ?? ""}
                      x={start.x}
                      y={start.y}
                      fontSize={14}
                      fill="yellow"
                    />
                  );
                default:
                  return null;
              }
            }
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;
