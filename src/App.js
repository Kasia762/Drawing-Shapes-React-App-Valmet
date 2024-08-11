import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Transformer,Line } from 'react-konva';
import { SketchPicker } from 'react-color';
import './App.css';
import { Sidebar} from 'react-pro-sidebar';

const App = () => {
  // Drawing Line, Rectangle or Circle Status
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);
  const [currentShape, setCurrentShape] = useState(null);
  const [startPos, setStartPos] = useState(null);
  // Shape transforming Status
  const [shapeTransform, setShapeTransform] = useState(false);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  // color from SketchPicker
  const [color, setColor] = useState('#000000');
  // Shape type with default rectangle shape
  const [shapeType, setShapeType] = useState('rectangle');
  const transformerRef = useRef(null);
  // Highlight color of the the selected shape
  const shapeHighlight = 'yellow';
  // Line
  const [lineStartPos, setLineStartPos] = useState(null);
  const [currentLine, setCurrentLine] = useState(null);
  // File name for download
  const fileName = 'shapes.json';
  const windowHeight = window.innerHeight-100;
  const windowWidth = window.innerWidth-270;
  const canvasColor = 'white';

  // Handle mouse down event to start drawing
  const handleMouseDown = (event) => {
    if (isDrawing) {
      const stage = event.target.getStage();
      const pos = stage.getPointerPosition();
      setStartPos(pos);

      let newShape=null;

      //RECTANGLE
      if (shapeType === 'rectangle') {
        newShape={
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: color,
          id: `rect_${Date.now()}` // Ensure unique ID for transformer
        };

      //CIRCLE
      } else if (shapeType === 'circle') {
        newShape={
          x: pos.x,
          y: pos.y,
          radius: 0,
          fill: color,
          id: `circ_${Date.now()}` // Ensure unique ID for transformer
        };

        //LINE
      } else if (shapeType === 'line') {
        newShape={
          points: [pos.x, pos.y],
          stroke: color,
          strokeWidth: 8,
          id: `line_${Date.now()}`
        };
        setLineStartPos(pos);
        setCurrentLine(newShape);
      }
      setCurrentShape(newShape);
      setShapes([...shapes, newShape]);
    }
  };

  // Handle mouse move event to update shape size
  const handleMouseMove = (event) => {
    if (isDrawing && startPos) {
      const stage = event.target.getStage();
      const pos = stage.getPointerPosition();

      if (shapeType === 'rectangle' && currentShape) {
        const updatedShape = {
          ...currentShape,
          width: pos.x - startPos.x,
          height: pos.y - startPos.y,
        };
        setCurrentShape(updatedShape);
        updateLastShape(updatedShape);
      } else if (shapeType === 'circle' && currentShape) {
        const radius = Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2));
        const updatedShape = {
          ...currentShape,
          radius,
        };
        setCurrentShape(updatedShape);
        updateLastShape(updatedShape);
      } else if (shapeType === 'line' && currentLine) {
        const updatedLine = {
          ...currentLine,
          points: [lineStartPos.x, lineStartPos.y, pos.x, pos.y]
        };
        setCurrentLine(updatedLine);
        updateLastShape(updatedLine);
      }
    }
  };

// Handle mouse up event to finalize the shape
const handleMouseUp = () => {
  if (isDrawing && (currentShape || currentLine)) {
    setCurrentShape(null);
    setCurrentLine(null);
    setStartPos(null);
    setLineStartPos(null);
  }
};

// Helper function to update the last shape in the shapes array
const updateLastShape = (updatedShape) => {
  setShapes((prevShapes) =>
    prevShapes.map((shape, index) =>
      index === prevShapes.length - 1 ? updatedShape : shape
    )
  );
};

  // Handle shape selection
  const handleShapeClick = (index) => {
    setSelectedShapeIndex(index);
  };

  // Delete the selected shape
  const deleteShape = () => {
    if (selectedShapeIndex !== null) {
      setShapes(shapes.filter((_, index) => index !== selectedShapeIndex));
      setSelectedShapeIndex(null);
    }
  };

  const clearCanvas = () => {
    setShapes([]);
    setSelectedShapeIndex(null); 
    // Optionally clear the selected shape index as well
  };

  const handleLoad = (event) => {
    clearCanvas()
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
  
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        setShapes(jsonData);
      } catch (err) {
        alert('Error loading shapes: ' + err.message);
      }
    };
  
    reader.readAsText(file);
  };


  const handleSave = (e) => {
    // Convert shapes array to JSON string with formatting
    const jsonString = JSON.stringify(shapes, null, 2); 
    
    // Create a Blob with the JSON content
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // The name of the downloaded file
    link.download = fileName; 
    document.body.appendChild(link);
    link.click();

    // Clean up by revoking the URL and removing the link element
    URL.revokeObjectURL(url);
    link.remove();
  };

  // Button click handler
  const handleButtonClick = (action) => {
    if (['line','rectangle','circle'].includes(action)) {
      setShapeType(action);
      setIsDrawing(true);
      setShapeTransform(false);
    } else if (action === 'transform') {
      // Toggle shape movement
      setShapeTransform(!shapeTransform); 
      setIsDrawing(false);
    } else if (action === 'moveForward') {
      moveShapeForward();
    } else if (action === 'moveBackward') {
      moveShapeBackward();
    } else if (action === 'delete') {
      // Trigger shape deletion
      setIsDrawing(false);
      deleteShape(); 
    } else {
      setIsDrawing(false);
    }
  };

  // Handle color change
  const handleColorChange = (color) => {
    setColor(color.hex);
    if (shapeTransform){
      // Apply the color to the selected shape
      updateShapeColor(color.hex);
    }
  };

  // Update color of the selected shape
  const updateShapeColor = (color) => {
    if (selectedShapeIndex !== null) {
      setShapes(shapes.map((shape, index) =>
        index === selectedShapeIndex
          ? { ...shape, fill: color }
          : shape
      ));
    }
  };

  // Move selected shape forward
  const moveShapeForward = () => {
    if (selectedShapeIndex !== null && selectedShapeIndex < shapes.length - 1) {
      const updatedShapes = [...shapes];
      const [movedShape] = updatedShapes.splice(selectedShapeIndex, 1);
      updatedShapes.splice(selectedShapeIndex + 1, 0, movedShape);
      setShapes(updatedShapes);
      setSelectedShapeIndex(selectedShapeIndex + 1);
    }
  };

  // Move selected shape backward
  const moveShapeBackward = () => {
    if (selectedShapeIndex !== null && selectedShapeIndex > 0) {
      const updatedShapes = [...shapes];
      const [movedShape] = updatedShapes.splice(selectedShapeIndex, 1);
      updatedShapes.splice(selectedShapeIndex - 1, 0, movedShape);
      setShapes(updatedShapes);
      setSelectedShapeIndex(selectedShapeIndex - 1);
    }
  };

  // Update the transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && selectedShapeIndex !== null) {
      const selectedShape = shapes[selectedShapeIndex];
      const shapeNode = transformerRef.current.getLayer().findOne(`#${selectedShape.id}`);
      if (shapeNode) {
        transformerRef.current.nodes([shapeNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedShapeIndex, shapes]);
  
  return (
    <div style={{ display: 'flex', height: '100%'}}>
      <Sidebar>
        <div class="buttonContainer">
        {`Drawing Shapes App`}
          <button
            className={`button`} 
            onClick={() => handleSave('save')}
            >Save</button>
          <input className={`button`}
            type="file" accept="application/json" onChange={handleLoad} />
        </div>
      <div class="container">
        <SketchPicker
          color={color}
          onChangeComplete={handleColorChange}
        />
      </div> 
      <div class="buttonContainer">
        <button
          className={`button ${isDrawing && shapeType === 'line' ? 'active' : 'default'}`} 
          onClick={() => handleButtonClick('line')}
          >Draw Line</button>
        <button 
          className={`button ${isDrawing && shapeType === 'rectangle' ? 'active' : 'default'}`}
          onClick={() => handleButtonClick('rectangle')}
          >Draw Rectangle</button>
        <button
          className={`button ${isDrawing && shapeType === 'circle' ? 'active' : 'default'}`} 
          onClick={() => handleButtonClick('circle')}
          >Draw Circle</button>
      </div>
      <div class="buttonContainer">
        <button 
          className={`button ${shapeTransform ? 'active' : 'default'}`}
          onClick={() => handleButtonClick('transform')}
          >Transform</button>
        <button
          className={`button ${shapeTransform && selectedShapeIndex !== null ? 'available' : 'blocked'}`}
          onClick={() => handleButtonClick('moveBackward')}
          >Move Backward</button>
        <button
          className={`button ${shapeTransform && selectedShapeIndex !== null ? 'available' : 'blocked'}`}
          onClick={() => handleButtonClick('moveForward')}
          >Move Forward</button>
      </div>
      <div class="buttonContainer">
        <button 
          className={`button ${selectedShapeIndex !== null ? 'available' : 'blocked'}`}
          onClick={() => handleButtonClick('delete')}
          >Delete</button>
        <button 
          className={`button`}
          onClick={() => clearCanvas()}
          >Clear Canvas</button>
      </div>
      </Sidebar>
      <Stage
        width={windowWidth}
        // Height varies for window for canvas to fit the window
        height={windowHeight} 
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Rect
            width={windowWidth}
            // Height varies for canvas to fit the window
            height={windowHeight}
            fill={canvasColor}
            stroke ={"rgb(189, 219, 218)"}
          />
        </Layer>
        <Layer>
          {shapes.map((shape, index) => (
            <React.Fragment key={shape.id}>
              {shape.width !== undefined && shape.height !== undefined && (
                <Rect
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  stroke={index === selectedShapeIndex ? shapeHighlight: "black"}
                  strokeWidth={index === selectedShapeIndex ? 3 : 1}
                  draggable={shapeTransform}
                  onClick={() => handleShapeClick(index)}
                />
              )}
              {shape.radius !== undefined && (
                <Circle
                  id={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  stroke={index === selectedShapeIndex ? shapeHighlight : "black"}
                  strokeWidth={index === selectedShapeIndex ? 3 : 1}
                  draggable={shapeTransform}
                  onClick={() => handleShapeClick(index)}
                />
              )}
              {shape.points && (
                <Line
                  id={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  draggable={shapeTransform}
                  onClick={() => handleShapeClick(index)}
                />
              )}
              {index === selectedShapeIndex && shapeTransform && (
                <Transformer
                  ref={transformerRef}
                  resizeEnabled={true}
                  rotateEnabled={false}
                />
              )}
            </React.Fragment>
          ))}
          {currentShape && shapeType === 'rectangle' && (
            <Rect
              x={currentShape.x}
              y={currentShape.y}
              width={currentShape.width}
              height={currentShape.height}
              fill={currentShape.fill}
            />
          )}
          {currentShape && shapeType === 'circle' && (
            <Circle
              x={currentShape.x}
              y={currentShape.y}
              radius={currentShape.radius}
              fill={currentShape.fill}
            />
          )}
          {currentLine && shapeType === 'line' && (
            <Line
              points={currentLine.points}
              stroke={currentLine.stroke}
              strokeWidth={currentLine.strokeWidth}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default App;
