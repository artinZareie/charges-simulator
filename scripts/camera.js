export function CameraControl(renderer, camera, updateCallback) {
  this.zoomMode = false;
  this.press = false;
  this.sensitivity = 0.02;

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (!this.press) {
      return;
    }

    if (event.button == 0) {
      camera.position.y -= event.movementY * this.sensitivity;
      camera.position.x -= event.movementX * this.sensitivity;
    } else if (event.button == 2) {
      camera.quaternion.y -= (event.movementX * this.sensitivity) / 10;
      camera.quaternion.x -= (event.movementY * this.sensitivity) / 10;
    }

    updateCallback();
  });

  renderer.domElement.addEventListener("mousedown", () => {
    this.press = true;
  });
  renderer.domElement.addEventListener("mouseup", () => {
    this.press = false;
  });
  renderer.domElement.addEventListener("mouseleave", () => {
    this.press = false;
  });

  document.addEventListener("keydown", (event) => {
    if (event.key == "Shift") {
      this.zoomMode = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key == "Shift") {
      this.zoomMode = false;
    }
  });

  renderer.domElement.addEventListener("mousewheel", (event) => {
    if (this.zoomMode) {
      camera.fov -= event.wheelDelta * this.sensitivity;
      camera.updateProjectionMatrix();
    } else {
      camera.position.z += event.wheelDelta * this.sensitivity;
    }

    updateCallback();
  });
}
