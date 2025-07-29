import { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Line, Circle, Rect, Arrow } from "react-konva";
import { useRoom } from "../hooks/useRoom";
import {
  Pen,
  Eraser,
  Circle as CircleIcon,
  Square,
  ArrowUpRight,
  Undo2,
  Redo2,
  Trash2,
  PaintBucket,
  Save,
} from "lucide-react";
import drawingService from "../services/drawingService";
import toast from "react-hot-toast";

const TOOLS = {
  PEN: "pen",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ARROW: "arrow",
};

const ToolButton = ({ isActive, onClick, children, title, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
      isDisabled
        ? "opacity-50 cursor-not-allowed"
        : isActive
        ? "bg-blue-600 text-white shadow-inner"
        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
    }`}
    title={title}
  >
    {children}
  </button>
);

const Whiteboard = ({ roomId, sendDrawing }) => {
  const [tool, setTool] = useState(TOOLS.PEN);
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [tempShape, setTempShape] = useState(null);
  const [history, setHistory] = useState([{ lines: [], shapes: [] }]);
  const [historyStep, setHistoryStep] = useState(0);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [isInitialized, setIsInitialized] = useState(false);
  const autoSaveIntervalRef = useRef(null);
  const currentDataRef = useRef({ lines: [], shapes: [] });
  const { canvasData } = useRoom(roomId);

  //  current data ref
  useEffect(() => {
    currentDataRef.current = { lines, shapes };
  }, [lines, shapes]);

  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);

  const updateStageDimensions = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.offsetWidth - 20; // Subtract margin
      const containerHeight = window.innerHeight - container.offsetTop - 40; // Subtract margins and padding
      setStageSize({
        width: Math.max(800, containerWidth),
        height: Math.max(600, containerHeight),
      });
    }
  }, []);

  useEffect(() => {
    updateStageDimensions();
    window.addEventListener("resize", updateStageDimensions);
    return () => window.removeEventListener("resize", updateStageDimensions);
  }, [updateStageDimensions]);

  //  initial drawing state
  useEffect(() => {
    const loadDrawing = async () => {
      try {
        const response = await drawingService.getLatestDrawing(roomId);
        if (response.data) {
          const { lines: savedLines, shapes: savedShapes } = response.data;
          setLines(savedLines || []);
          setShapes(savedShapes || []);
          setHistory([{ lines: savedLines || [], shapes: savedShapes || [] }]);
          setHistoryStep(0);
        }
        setIsInitialized(true); // Mark as initialized after loading
      } catch (err) {
        console.error("Failed to load drawing:", err);
        setIsInitialized(true); // Still mark as initialized even if load fails
      }
    };
    loadDrawing();

    return () => {
      setIsInitialized(false);
    };
  }, [roomId]);

  // Auto-save
  useEffect(() => {
    if (!isInitialized) return;

    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    const saveDrawing = async () => {
      const { lines: currentLines, shapes: currentShapes } =
        currentDataRef.current;
      if ((currentLines.length > 0 || currentShapes.length > 0) && roomId) {
        try {
          await drawingService.saveDrawing(roomId, {
            lines: currentLines,
            shapes: currentShapes,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      }
    };

    autoSaveIntervalRef.current = setInterval(saveDrawing, 60000);

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
        autoSaveIntervalRef.current = null;
      }
    };
  }, [isInitialized, roomId]);

  const handleSaveDrawing = async () => {
    if (!isInitialized || (!lines.length && !shapes.length)) return;

    try {
      await drawingService.saveDrawing(roomId, {
        lines,
        shapes,
        timestamp: new Date().toISOString(),
      });
      toast.success("Drawing saved successfully");
    } catch (err) {
      console.error("Failed to save drawing:", err);
      toast.error("Failed to save drawing");
    }
  };

  const colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#808080",
    "#800000",
  ];

  // Handle received drawings
  useEffect(() => {
    if (canvasData.length > 0) {
      const lastDrawing = canvasData[canvasData.length - 1];
      if (lastDrawing.type === "line") {
        setLines((prev) => [...prev, lastDrawing]);
      } else if (lastDrawing.type === "shape") {
        const newShape = {
          type: lastDrawing.shapeType,
          x: lastDrawing.x,
          y: lastDrawing.y,
          width: lastDrawing.width,
          height: lastDrawing.height,
          radius: lastDrawing.radius,
          points: lastDrawing.points,
          stroke: lastDrawing.stroke,
          strokeWidth: lastDrawing.strokeWidth,
          fill: lastDrawing.fill,
          pointerLength: lastDrawing.pointerLength,
          pointerWidth: lastDrawing.pointerWidth,
        };
        setShapes((prev) => [...prev, newShape]);
      } else if (lastDrawing.type === "clear") {
        setLines([]);
        setShapes([]);
        setHistory([{ lines: [], shapes: [] }]);
        setHistoryStep(0);
      } else if (lastDrawing.type === "undo" || lastDrawing.type === "redo") {
        setLines(lastDrawing.state.lines);
        setShapes(lastDrawing.state.shapes);
        setHistoryStep(lastDrawing.historyStep);
      }
    }
  }, [canvasData]);

  const addToHistory = (newLines, newShapes) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ lines: newLines, shapes: newShapes });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const pos = e.target.getStage().getPointerPosition();

    if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
      const newLine = {
        type: "line",
        tool,
        points: [pos.x, pos.y],
        strokeWidth: tool === TOOLS.ERASER ? brushSize * 3 : brushSize,
        stroke: tool === TOOLS.ERASER ? "#ffffff" : color,
        tension: 0.5,
        lineCap: "round",
        lineJoin: "round",
        globalCompositeOperation:
          tool === TOOLS.ERASER ? "destination-out" : "source-over",
      };
      setLines([...lines, newLine]);
    } else {
      const newTempShape = {
        type:
          tool === TOOLS.CIRCLE
            ? "circle"
            : tool === TOOLS.ARROW
            ? "arrow"
            : "rect",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        startX: pos.x, // Store the initial X position
        startY: pos.y, // Store the initial Y position
        points: tool === TOOLS.ARROW ? [pos.x, pos.y, pos.x, pos.y] : undefined,
        stroke: color,
        strokeWidth: brushSize,
        draggable: false,
        pointerLength: tool === TOOLS.ARROW ? 20 : undefined,
        pointerWidth: tool === TOOLS.ARROW ? 20 : undefined,
        fill: tool === TOOLS.ARROW ? color : undefined,
      };
      setTempShape(newTempShape);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current) return;

    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        const newPoints = lastLine.points.concat([pos.x, pos.y]);
        const updatedLine = {
          ...lastLine,
          points: newPoints,
        };
        setLines([...lines.slice(0, -1), updatedLine]);
      }
    } else if (tempShape) {
      if (tool === TOOLS.CIRCLE) {
        // Calculate the diameter based on the distance between start point and current position
        const dx = pos.x - tempShape.startX;
        const dy = pos.y - tempShape.startY;
        const diameter = Math.sqrt(dx * dx + dy * dy) * 2;

        // Update circle position to be centered between start point and current position
        const centerX = tempShape.startX + dx / 2;
        const centerY = tempShape.startY + dy / 2;

        setTempShape({
          ...tempShape,
          x: centerX,
          y: centerY,
          radius: diameter / 2,
        });
      } else if (tool === TOOLS.ARROW) {
        setTempShape({
          ...tempShape,
          points: [tempShape.x, tempShape.y, pos.x, pos.y],
        });
      } else {
        setTempShape({
          ...tempShape,
          width: pos.x - tempShape.x,
          height: pos.y - tempShape.y,
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;

    isDrawingRef.current = false;

    if (tool === TOOLS.PEN || tool === TOOLS.ERASER) {
      const lastLine = lines[lines.length - 1];
      if (lastLine && lastLine.points.length > 2) {
        sendDrawing({ type: "line", ...lastLine });
        addToHistory([...lines], shapes);
      } else {
        setLines(lines.slice(0, -1));
      }
    } else if (tempShape) {
      const finalShape = { ...tempShape };
      setShapes([...shapes, finalShape]);
      setTempShape(null);
      sendDrawing({
        type: "shape",
        shapeType: finalShape.type,
        x: finalShape.x,
        y: finalShape.y,
        width: finalShape.width,
        height: finalShape.height,
        radius: finalShape.radius,
        points: finalShape.points,
        stroke: finalShape.stroke,
        strokeWidth: finalShape.strokeWidth,
        fill: finalShape.fill,
        pointerLength: finalShape.pointerLength,
        pointerWidth: finalShape.pointerWidth,
      });
      addToHistory(lines, [...shapes, finalShape]);
    }
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      const previousState = history[newStep];
      setLines(previousState.lines);
      setShapes(previousState.shapes);
      setHistoryStep(newStep);
      sendDrawing({
        type: "undo",
        historyStep: newStep,
        state: previousState,
      });
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      const nextState = history[newStep];
      setLines(nextState.lines);
      setShapes(nextState.shapes);
      setHistoryStep(newStep);
      sendDrawing({
        type: "redo",
        historyStep: newStep,
        state: nextState,
      });
    }
  };

  const handleClear = () => {
    setLines([]);
    setShapes([]);
    setHistory([{ lines: [], shapes: [] }]);
    setHistoryStep(0);
    sendDrawing({ type: "clear" });
  };

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="p-2 flex items-center gap-2">
          {/* Drawing Tools */}
          <div className="flex items-center gap-1 p-1 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <ToolButton
              isActive={tool === TOOLS.PEN}
              onClick={() => setTool(TOOLS.PEN)}
              title="Pen Tool (P)"
            >
              <Pen className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              isActive={tool === TOOLS.ERASER}
              onClick={() => setTool(TOOLS.ERASER)}
              title="Eraser Tool (E)"
            >
              <Eraser className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              isActive={tool === TOOLS.CIRCLE}
              onClick={() => setTool(TOOLS.CIRCLE)}
              title="Circle Tool (C)"
            >
              <CircleIcon className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              isActive={tool === TOOLS.RECTANGLE}
              onClick={() => setTool(TOOLS.RECTANGLE)}
              title="Rectangle Tool (R)"
            >
              <Square className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              isActive={tool === TOOLS.ARROW}
              onClick={() => setTool(TOOLS.ARROW)}
              title="Arrow Tool (A)"
            >
              <ArrowUpRight className="h-4 w-4" />
            </ToolButton>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Brush Size */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <PaintBucket className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Size:
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
              title={`Brush Size: ${brushSize}px`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[3ch]">
              {brushSize}
            </span>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-lg transition-all duration-200 hover:scale-110 ${
                  color === c
                    ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800 scale-110"
                    : ""
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-6 h-6 hover:scale-110 transition-all duration-200"
              title="Custom Color"
            />
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* History Controls */}
          <div className="flex items-center gap-1">
            <ToolButton
              onClick={handleUndo}
              title="Undo (Ctrl+Z)"
              isDisabled={historyStep === 0}
            >
              <Undo2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              onClick={handleRedo}
              title="Redo (Ctrl+Y)"
              isDisabled={historyStep === history.length - 1}
            >
              <Redo2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton onClick={handleClear} title="Clear Canvas">
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
            </ToolButton>
          </div>

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Save Button */}
          <ToolButton
            onClick={handleSaveDrawing}
            title="Save Drawing"
            isDisabled={!isInitialized || (!lines.length && !shapes.length)}
          >
            <Save className="h-4 w-4" />
          </ToolButton>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          ref={stageRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            backgroundColor: "#fff",
            cursor: tool === TOOLS.CIRCLE ? "crosshair" : "default",
          }}
        >
          <Layer>
            <Rect
              width={stageSize.width}
              height={stageSize.height}
              fill="#ffffff"
            />

            {shapes.map((shape, i) =>
              shape.type === "circle" ? (
                <Circle
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              ) : shape.type === "arrow" ? (
                <Arrow
                  key={i}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  fill={shape.fill}
                  pointerLength={shape.pointerLength}
                  pointerWidth={shape.pointerWidth}
                />
              ) : (
                <Rect
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                />
              )
            )}

            {lines.map((line, i) => (
              <Line key={i} {...line} />
            ))}

            {tempShape &&
              (tempShape.type === "circle" ? (
                <Circle
                  x={tempShape.x}
                  y={tempShape.y}
                  radius={tempShape.radius}
                  stroke={tempShape.stroke}
                  strokeWidth={tempShape.strokeWidth}
                />
              ) : tempShape.type === "arrow" ? (
                <Arrow
                  points={tempShape.points}
                  stroke={tempShape.stroke}
                  strokeWidth={tempShape.strokeWidth}
                  fill={tempShape.fill}
                  pointerLength={tempShape.pointerLength}
                  pointerWidth={tempShape.pointerWidth}
                />
              ) : (
                <Rect
                  x={tempShape.x}
                  y={tempShape.y}
                  width={tempShape.width}
                  height={tempShape.height}
                  stroke={tempShape.stroke}
                  strokeWidth={tempShape.strokeWidth}
                />
              ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default Whiteboard;
