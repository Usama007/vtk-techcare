import { useState, useRef, useEffect } from "react";

import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";

import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSTLReader from "@kitware/vtk.js/IO/Geometry/STLReader";

const files = ["./assets/bomb_omb_v1.stl", "./assets/Deer_Voronoi.stl"];

function App() {
  const vtkContainerRef = useRef(null);
  const context = useRef(null);
  const [representation, setRepresentation] = useState(2);
  const [fileIndex, setfileIndex] = useState(0);

  useEffect(() => {
    if (!context.current) {
      setRepresentation(2);
      const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
        rootContainer: vtkContainerRef.current,
      });
      const coneSource = vtkSTLReader.newInstance();

      coneSource.setUrl(files[fileIndex]).then((d) => {
        const mapper = vtkMapper.newInstance();
        mapper.setInputConnection(coneSource.getOutputPort());

        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);

        const renderer = fullScreenRenderer.getRenderer();
        const renderWindow = fullScreenRenderer.getRenderWindow();

        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();

        context.current = {
          fullScreenRenderer,
          renderWindow,
          renderer,
          coneSource,
          actor,
          mapper,
        };
      });
    }

    return () => {
      if (context.current) {
        const { fullScreenRenderer, coneSource, actor, mapper } =
          context.current;
        actor.delete();
        mapper.delete();
        coneSource.delete();
        fullScreenRenderer.delete();
        context.current = null;
      }
    };
  }, [vtkContainerRef, fileIndex]);

  useEffect(() => {
    if (context.current) {
      const { actor, renderWindow } = context.current;
      actor.getProperty().setColor([0.8, 0.2, 0.5]);
      actor.getProperty().setRepresentation(representation);
      renderWindow.render();
    }
  }, [representation]);

  return (
    <div>
      <div ref={vtkContainerRef} />

      <table
        style={{
          position: "absolute",
          top: "25px",
          left: "25px",
          background: "white",
          padding: "12px",
        }}
      >
        <tbody>
          <tr>
            <td>
              <select
                value={representation}
                style={{ width: "100%" }}
                onInput={(ev) => setRepresentation(Number(ev.target.value))}
              >
                <option value="0">Points</option>
                <option value="1">Wireframe</option>
                <option value="2">Surface</option>
              </select>
            </td>
          </tr>

          <tr>
            <td>
              <select
                value={fileIndex}
                style={{ width: "100%" }}
                onInput={(ev) => {
                  setfileIndex(ev.target.value);
                }}
              >
                <option value="0">Bomb</option>
                <option value="1">Deear</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
