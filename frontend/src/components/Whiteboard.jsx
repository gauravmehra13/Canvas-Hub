import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Stage, Layer, Line, Circle, Rect, Arrow, Text } from "react-konva";
import { useRoom } from "../hooks/useRoom";
import {
  Pen,
  Eraser,
  Circle as CircleIcon,
  Square,
  ArrowUpRight,
  Slash,
  Undo2,
  Redo2,
  Trash2,
  PaintBucket,
  Save,
  Type as TypeIcon,
} from "lucide-react";
import drawingService from "../services/drawingService";
import toast from "react-hot-toast";

const TOOLS = {
  PEN: "pen",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ARROW: "arrow",
  LINE: "line",
  TEXT: "text",
};

const ToolButton = ({ isActive, onClick, children, title, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`cursor-pointer p-2 rounded-lg transition-all duration-200 ${
      isDisabled
        ? "opacity-50 cursor-not-allowed text-gray-400"
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
  const [editingText, setEditingText] = useState(null); // { x, y, value }
  const textAreaRef = useRef(null);

  //  current data ref
  useEffect(() => {
    currentDataRef.current = { lines, shapes };
  }, [lines, shapes]);

  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const stageWrapperRef = useRef(null);
  const isDrawingRef = useRef(false);

  // focus textarea when entering text edit mode
  useEffect(() => {
    if (editingText && textAreaRef.current) {
      console.log("[Whiteboard] textarea mount/focus at dom:", {
        domX: editingText.domX,
        domY: editingText.domY,
        x: editingText.x,
        y: editingText.y,
      });
      textAreaRef.current.focus();
    }
  }, [editingText]);

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
        if (lastDrawing.shapeType === "text") {
          console.log("[Whiteboard] received text shape:", {
            text: lastDrawing.text,
            x: lastDrawing.x,
            y: lastDrawing.y,
            fontSize: lastDrawing.fontSize,
            fill: lastDrawing.fill,
          });
        }
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
          text: lastDrawing.text,
          fontSize: lastDrawing.fontSize,
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

  const addToHistory = useCallback(
    (newLines, newShapes) => {
      const newHistory = history.slice(0, historyStep + 1);
      newHistory.push({ lines: newLines, shapes: newShapes });
      setHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    },
    [history, historyStep]
  );

  const handleMouseDown = (e) => {
    isDrawingRef.current = true;
    const stage = stageRef.current || e.target.getStage();
    if (!stage) {
      console.warn("[Whiteboard] No stage ref available on mousedown");
      return;
    }
    const pos = stage.getPointerPosition();

    if (tool === TOOLS.TEXT) {
      if (editingText) {
        // commit previous text before starting a new one
        commitTextEditing();
      }
      const pointer = stage.getPointerPosition();
      if (!pointer) {
        console.warn("[Whiteboard] No pointer position for text click");
        isDrawingRef.current = false;
        return;
      }
      const stageRect = stage.container().getBoundingClientRect();
      const wrapperRect = stageWrapperRef.current
        ? stageWrapperRef.current.getBoundingClientRect()
        : { left: 0, top: 0 };
      const domX = stageRect.left - wrapperRect.left + pointer.x;
      const domY = stageRect.top - wrapperRect.top + pointer.y;
      const pageDomX = stageRect.left + pointer.x;
      const pageDomY = stageRect.top + pointer.y;
      console.log("[Whiteboard] text mousedown:", {
        stageX: pointer.x,
        stageY: pointer.y,
        domX,
        domY,
        pageDomX,
        pageDomY,
      });
      // if already editing somewhere else, commit before starting new
      // here we just commit on blur via setEditingText; start new editing
      setEditingText({
        x: pointer.x,
        y: pointer.y,
        domX,
        domY,
        pageDomX,
        pageDomY,
        value: "",
      });
      isDrawingRef.current = false;
      return;
    }

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
            : tool === TOOLS.LINE
            ? "line"
            : "rect",
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        radius: 0,
        startX: pos.x, // Store the initial X position
        startY: pos.y, // Store the initial Y position
        points:
          tool === TOOLS.ARROW || tool === TOOLS.LINE
            ? [pos.x, pos.y, pos.x, pos.y]
            : undefined,
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
      } else if (tool === TOOLS.LINE) {
        setTempShape({
          ...tempShape,
          points: [tempShape.startX, tempShape.startY, pos.x, pos.y],
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

  const commitTextEditing = useCallback(
    (opts = { cancel: false }) => {
      if (!editingText) return;
      const value = (editingText.value || "").trim();
      const shouldCancel = opts.cancel || value.length === 0;
      if (shouldCancel) {
        setEditingText(null);
        return;
      }

      const fontSizePx = Math.max(brushSize, 16);
      const finalShape = {
        type: "text",
        x: editingText.x,
        y: editingText.y,
        text: editingText.value,
        fill: "#000000", // force black for debug visibility
        fontSize: fontSizePx,
      };
      const newShapes = [...shapes, finalShape];
      setShapes(newShapes);
      setEditingText(null);

      console.log(
        "[Whiteboard] commitTextEditing -> adding shape:",
        finalShape
      );

      sendDrawing({
        type: "shape",
        shapeType: "text",
        x: finalShape.x,
        y: finalShape.y,
        text: finalShape.text,
        fill: finalShape.fill,
        fontSize: finalShape.fontSize,
      });
      addToHistory(lines, newShapes);
    },
    [editingText, brushSize, shapes, lines, addToHistory, sendDrawing]
  );

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
    setEditingText(null);
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
              isActive={tool === TOOLS.LINE}
              onClick={() => setTool(TOOLS.LINE)}
              title="Line Tool (L)"
            >
              <Slash className="h-4 w-4" />
            </ToolButton>
            <ToolButton
              isActive={tool === TOOLS.TEXT}
              onClick={() => setTool(TOOLS.TEXT)}
              title="Text Tool (T)"
            >
              <TypeIcon className="h-4 w-4" />
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

      <div className="flex-1 overflow-hidden relative" ref={stageWrapperRef}>
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
            cursor: [
              TOOLS.CIRCLE,
              TOOLS.RECTANGLE,
              TOOLS.ARROW,
              TOOLS.LINE,
              TOOLS.TEXT,
            ].includes(tool)
              ? tool === TOOLS.TEXT
                ? "text"
                : "crosshair"
              : "default",
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
              ) : shape.type === "text" ? (
                <Text
                  key={i}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text}
                  fontSize={shape.fontSize || 16}
                  fill={shape.fill || "#000"}
                  fontFamily="Calibri, Arial, sans-serif"
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
              ) : shape.type === "line" ? (
                <Line
                  key={i}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  lineCap="round"
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
              ) : tempShape.type === "line" ? (
                <Line
                  points={tempShape.points}
                  stroke={tempShape.stroke}
                  strokeWidth={tempShape.strokeWidth}
                  lineCap="round"
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

        {editingText &&
          createPortal(
            <div
              style={{
                position: "absolute",
                // Position relative to the stage wrapper to avoid page overflow/scrollbars
                left: editingText.domX ?? editingText.x,
                top: editingText.domY ?? editingText.y,
                zIndex: 999999,
              }}
            >
              <textarea
                ref={textAreaRef}
                value={editingText.value}
                onChange={(e) =>
                  setEditingText((prev) => ({ ...prev, value: e.target.value }))
                }
                // Do NOT commit on blur to avoid instant disappearance
                onBlur={() =>
                  console.log("[Whiteboard] textarea blur (ignored)")
                }
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    commitTextEditing({ cancel: true });
                  } else if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitTextEditing();
                  }
                }}
                style={{
                  fontSize: `${Math.max(brushSize, 16)}px`,
                  color: "#000",
                  padding: 4,
                  margin: 0,
                  border: "1px solid rgba(0,0,0,0.4)",
                  outline: "none",
                  background: "rgba(255,255,255,0.98)",
                  whiteSpace: "pre",
                  lineHeight: 1.3,
                  minWidth: "120px",
                  minHeight: "28px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  fontFamily: "Calibri, Arial, sans-serif",
                }}
                placeholder="Type... (Enter to commit)"
              />
              <button
                type="button"
                onClick={() => commitTextEditing({ cancel: true })}
                title="Cancel (Esc)"
                aria-label="Cancel text"
                style={{
                  position: "absolute",
                  right: -10,
                  top: -10,
                  width: 22,
                  height: 22,
                  borderRadius: 9999,
                  border: "1px solid rgba(0,0,0,0.4)",
                  background: "#fff",
                  color: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>,
            // Render inside the stage wrapper so the overlay doesn't expand the page
            stageWrapperRef.current || document.body
          )}
      </div>
    </div>
  );
};

export default Whiteboard;
