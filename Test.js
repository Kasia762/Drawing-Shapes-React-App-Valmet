
/*
const App = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>

        <Rect
          x={50} // x position of the square
          y={50} // y position of the square
          width={100} // width of the square
          height={100} // height of the square (same as width for a perfect square)
          fill="blue" // color of the square
          draggable={true} // make it non-draggable, so it stays in place
          rotation={50}
        />
      </Layer>
    </Stage>
  );
};

export default App;*/


/*
function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [shapes, setShapes] = useState([]);
  const [selectedShapeIndex, setSelectedShapeIndex] = useState(null);
  const [selectedColor, setSelectedColor] = useState('#0000FF'); // Default color is blue
  const [currentShape, setCurrentShape] = useState('rectangle'); // Default shape type
  const [resizeHandle, setResizeHandle] = useState(null); // Track which handle is used for resizing

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all shapes stored in state
    shapes.forEach((shape, index) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = 2;

      if (shape.type === 'rectangle') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        if (index === selectedShapeIndex) {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          drawResizeHandles(ctx, shape);
        }
      } else if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.fill();
        if (index === selectedShapeIndex) {
          ctx.stroke();
          drawResizeHandles(ctx, { x: shape.x, y: shape.y, width: shape.radius * 2, height: shape.radius * 2 });
        }
      } else if (shape.type === 'triangle') {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.lineTo(shape.x3, shape.y3);
        ctx.closePath();
        ctx.fill();
        if (index === selectedShapeIndex) {
          ctx.stroke();
        }
      } else if (shape.type === 'line') {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      }
    });
  }, [shapes, selectedShapeIndex, resizeHandle]);

  const drawResizeHandles = (ctx, shape) => {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    // Draw handles at the corners or edges
    ctx.arc(shape.x, shape.y, 5, 0, Math.PI * 2); // Top-left
    ctx.arc(shape.x + shape.width, shape.y, 5, 0, Math.PI * 2); // Top-right
    ctx.arc(shape.x, shape.y + shape.height, 5, 0, Math.PI * 2); // Bottom-left
    ctx.arc(shape.x + shape.width, shape.y + shape.height, 5, 0, Math.PI * 2); // Bottom-right
    ctx.fill();
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const selectedIndex = shapes.findIndex(shape => {
      if (shape.type === 'rectangle') {
        return mouseX > shape.x && mouseX < shape.x + shape.width && mouseY > shape.y && mouseY < shape.y + shape.height;
      } else if (shape.type === 'circle') {
        const dx = mouseX - shape.x;
        const dy = mouseY - shape.y;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
      } else if (shape.type === 'triangle') {
        const { x1, y1, x2, y2, x3, y3 } = shape;
        const area = Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
        const area1 = Math.abs((mouseX*(y2-y1) + x1*(y3-mouseY) + x2*(mouseY-y2)) / 2);
        const area2 = Math.abs((x1*(mouseY-y3) + mouseX*(y3-y1) + x3*(y1-mouseY)) / 2);
        const area3 = Math.abs((x2*(y1-y3) + x3*(y2-mouseY) + mouseX*(y3-y2)) / 2);
        return area === (area1 + area2 + area3);
      } else if (shape.type === 'line') {
        const { x1, y1, x2, y2 } = shape;
        const distance = Math.abs((x2 - x1) * (y1 - mouseY) - (x1 - mouseX) * (y2 - y1)) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        return distance < 5; // Tolerance for line selection
      }
      return false;
    });

    if (selectedIndex !== -1) {
      setSelectedShapeIndex(selectedIndex);

      const shape = shapes[selectedIndex];
      const isResizeHandle = 
        Math.abs(mouseX - shape.x) < 10 && Math.abs(mouseY - shape.y) < 10 ||
        Math.abs(mouseX - (shape.x + shape.width)) < 10 && Math.abs(mouseY - shape.y) < 10 ||
        Math.abs(mouseX - shape.x) < 10 && Math.abs(mouseY - (shape.y + shape.height)) < 10 ||
        Math.abs(mouseX - (shape.x + shape.width)) < 10 && Math.abs(mouseY - (shape.y + shape.height)) < 10;

      if (isResizeHandle) {
        setIsResizing(true);
        setResizeHandle(mouseX, mouseY);
      } else {
        setIsMoving(true);
        setStartX(mouseX);
        setStartY(mouseY);
      }
    } else {
      setSelectedShapeIndex(null);
      setStartX(mouseX);
      setStartY(mouseY);
      setIsDrawing(true);

      const newShape = { color: selectedColor, type: currentShape };

      if (currentShape === 'rectangle') {
        setShapes([...shapes, { ...newShape, x: mouseX, y: mouseY, width: 0, height: 0 }]);
      } else if (currentShape === 'circle') {
        setShapes([...shapes, { ...newShape, x: mouseX, y: mouseY, radius: 0 }]);
      } else if (currentShape === 'triangle') {
        setShapes([...shapes, { ...newShape, x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY, x3: mouseX, y3: mouseY }]);
      } else if (currentShape === 'line') {
        setShapes([...shapes, { ...newShape, x1: mouseX, y1: mouseY, x2: mouseX, y2: mouseY }]);
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const newShapes = [...shapes];
      if (currentShape === 'rectangle') {
        const shape = newShapes[newShapes.length - 1];
        shape.width = currentX - shape.x;
        shape.height = currentY - shape.y;
      } else if (currentShape === 'circle') {
        const shape = newShapes[newShapes.length - 1];
        shape.radius = Math.sqrt((currentX - shape.x) ** 2 + (currentY - shape.y) ** 2);
      } else if (currentShape === 'triangle') {
        const shape = newShapes[newShapes.length - 1];
        shape.x2 = currentX;
        shape.y2 = currentY;
        shape.x3 = shape.x1;
        shape.y3 = shape.y2;
      } else if (currentShape === 'line') {
        const shape = newShapes[newShapes.length - 1];
        shape.x2 = currentX;
        shape.y2 = currentY;
      }
      setShapes(newShapes);
    } else if (isMoving && selectedShapeIndex !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const dx = mouseX - startX;
      const dy = mouseY - startY;

      const newShapes = [...shapes];
      const shape = newShapes[selectedShapeIndex];

      if (shape.type === 'rectangle') {
        shape.x += dx;
        shape.y += dy;
      } else if (shape.type === 'circle') {
        shape.x += dx;
        shape.y += dy;
      } else if (shape.type === 'triangle') {
        shape.x1 += dx;
        shape.y1 += dy;
        shape.x2 += dx;
        shape.y2 += dy;
        shape.x3 += dx;
        shape.y3 += dy;
      } else if (shape.type === 'line') {
        shape.x1 += dx;
        shape.y1 += dy;
        shape.x2 += dx;
        shape.y2 += dy;
      }

      setShapes(newShapes);
      setStartX(mouseX);
      setStartY(mouseY);
    } else if (isResizing && selectedShapeIndex !== null) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newShapes = [...shapes];
      const shape = newShapes[selectedShapeIndex];

      if (shape.type === 'rectangle') {
        const dx = mouseX - startX;
        const dy = mouseY - startY;
        shape.width += dx;
        shape.height += dy;
        shape.width = Math.max(0, shape.width);
        shape.height = Math.max(0, shape.height);
      } else if (shape.type === 'circle') {
        const dx = mouseX - shape.x;
        const dy = mouseY - shape.y;
        shape.radius = Math.sqrt(dx * dx + dy * dy);
      } else if (shape.type === 'triangle') {
        // Simplified resize for triangle by adjusting the last point
        shape.x3 = mouseX;
        shape.y3 = mouseY;
      }

      setShapes(newShapes);
      setStartX(mouseX);
      setStartY(mouseY);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsMoving(false);
    setIsResizing(false);
  };

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
  };

  const handleShapeChange = (e) => {
    setCurrentShape(e.target.value);
  };

  const handleSave = () => {
    const json = JSON.stringify(shapes);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shapes.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const loadedShapes = JSON.parse(event.target.result);
        setShapes(loadedShapes);
      };
      reader.readAsText(file);
    }
  };

  const handleDelete = () => {
    if (selectedShapeIndex !== null) {
      const newShapes = shapes.filter((_, index) => index !== selectedShapeIndex);
      setShapes(newShapes);
      setSelectedShapeIndex(null);
    }
  };

  return (
    <div className="App">
      <div style={{ marginBottom: '10px' }}>
        <input 
          type="color" 
          value={selectedColor} 
          onChange={handleColorChange} 
          style={{ marginRight: '10px' }} 
        />
        <select value={currentShape} onChange={handleShapeChange}>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="line">Line</option>
        </select>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid black' }}
      />
      <div style={{ marginTop: '10px' }}>
        <button onClick={handleSave}>Save Shapes</button>
        <input type="file" accept="application/json" onChange={handleLoad} />
        {selectedShapeIndex !== null && (
          <button onClick={handleDelete} style={{ marginLeft: '10px' }}>
            Delete Selected Shape
          </button>
        )}
      </div>
    </div>
  );
}

export default App;*/