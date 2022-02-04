import * as THREE from "three";
import * as formula from "./formula";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import WebGL from "./webgl";

let ID_INC = 3;

function restartScene(scene) {
  while (scene.children.length) {
    scene.remove(scene.children[0]);
  }

  const camera = new THREE.PerspectiveCamera(
    75,
    document.querySelector(".canvas-section").clientWidth /
      document.querySelector(".canvas-section").clientHeight,
    0.1,
    1000
  );

  camera.position.z = 20;

  const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(light);
}

(function () {
  let recordes = [];
  let sphere_list = [];

  if (WebGL.isWebGLAvailable()) {
    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      document.querySelector(".canvas-section").clientWidth,
      document.querySelector(".canvas-section").clientHeight
    );

    document.querySelector("#add_rec").addEventListener("click", () => {
      let html = `<tr id="${ID_INC}">
      <td>
        <p>#${ID_INC}</p>
      </td>
      <td>
        <input value="-2e-4" name="charge" type="number">
      </td>
      <td>
        <label for="">x: </label>
        <input value="0" style="width: 4vw" name="x" type="number">
        <label for="">y: </label>
        <input value="0" style="width: 4vw" name="y" type="number" class="">
        <label for="">z: </label>
        <input value="0" name="z" style="width: 4vw" type="number" class="">
      </td>
    </tr>`;

      document.querySelector("tbody").innerHTML += html;
      ID_INC++;
    });

    document.querySelector(".animate").addEventListener("click", function () {
      recordes = [];
      while (scene.children.length) {
        scene.remove(scene.children[0]);
      }

      const camera = new THREE.PerspectiveCamera(
        75,
        document.querySelector(".canvas-section").clientWidth /
          document.querySelector(".canvas-section").clientHeight,
        0.1,
        1000
      );

      camera.position.z = 10;
      camera.position.x = 20;
      camera.rotateX(2);

      const light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
      scene.add(light);

      const controls = new OrbitControls(camera, renderer.domElement);

      document
        .querySelector(".canvas-section")
        .appendChild(renderer.domElement);

      Array.from(document.querySelector("tbody").childNodes).map((element) => {
        if (element.nodeName === "TR") {
          let values = {
            charge: 0,
            position: [0, 0, 0],
          };
          values.charge = parseFloat(
            element.querySelector("[name=charge]").value
          );
          values.position[0] = parseFloat(
            element.querySelector("[name=x]").value
          );
          values.position[1] = parseFloat(
            element.querySelector("[name=y]").value
          );
          values.position[2] = parseFloat(
            element.querySelector("[name=z]").value
          );
          recordes.push(values);
        }
      });

      let charges = recordes.map((p) => p.charge);

      let max_charge = Math.max(...charges);
      let min_charge = Math.min(...charges);

      sphere_list = recordes.map((particle) => {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshLambertMaterial({
          color: 0x216ccf,
          emissive: 0x9c72f7,
          emissiveIntensity:
            (particle.charge - min_charge) / (max_charge - min_charge) / 2 +
            0.5,
        });

        let sphere = new THREE.Mesh(geometry, material);
        sphere.position.set(...particle.position);
        sphere.velocity = [0, 0, 0];
        scene.add(sphere);
        return {
          sphere,
          geometry,
        };
      });

      let previousTimeStamp;

      this.animate = (timestamp) => {
        restartScene(scene);

        if (!previousTimeStamp) {
          previousTimeStamp = timestamp - 1e-8;
        }
        const elapsed = timestamp - previousTimeStamp;

        let forces = [];
        let delta = [];
        let r_hats = [];

        for (let i = 0; i < sphere_list.length; i++) {
          forces.push([0, 0, 0]);
          r_hats.push([]);
          for (let j = 0; j < sphere_list.length; j++) {
            if (i === j) {
              continue;
            }

            let r_vec = formula.substract_vectors(
              formula.vec2vec(sphere_list[i].sphere.position),
              formula.vec2vec(sphere_list[j].sphere.position)
            );
            console.log(r_vec);
            r_hats[i].push(r_vec);
            let force = formula.Force(
              recordes[i].charge,
              recordes[j].charge,
              r_vec
            );
            forces[i][0] += force[0];
            forces[i][1] += force[1];
            forces[i][2] += force[2];
          }
        }

        for (let i = 0; i < sphere_list.length; i++) {
          let position_vec = 0.5 * (elapsed / 1000) * (elapsed / 1000);
          position_vec = formula.scalar_product(forces[i], position_vec);
          if (position_vec !== position_vec) {
            position_vec = formula.vec2vec(sphere_list[i].sphere.position);
          }
          position_vec = formula.add_vectors(
            position_vec,
            formula.scalar_product(
              sphere_list[i].sphere.velocity,
              elapsed / 1000
            )
          );
          delta.push(position_vec);
          position_vec = formula.add_vectors(
            position_vec,
            formula.vec2vec(sphere_list[i].sphere.position)
          );
          sphere_list[i].sphere.velocity = formula.add_vectors(
            formula.scalar_product(
              forces[i],
              0.5 * (elapsed / 1000) * (elapsed / 1000)
            ),
            sphere_list[i].sphere.velocity
          );
        }

        let counter = -1;
        sphere_list.forEach((sphere) => {
          counter++;
          sphere.sphere.position.x += delta[counter][0];
          sphere.sphere.position.y += delta[counter][1];
          sphere.sphere.position.z += delta[counter][2];

          const arrowHelper = new THREE.ArrowHelper(
            new THREE.Vector3(...forces[counter]),
            sphere.sphere.position,
            formula.vector_amplitude(forces[counter]) / 10,
            0xffff00
          );
          scene.add(arrowHelper);

          scene.add(sphere.sphere);
        });

        previousTimeStamp = timestamp;
        renderer.render(scene, camera);
        window.requestAnimationFrame(this.animate.bind(this));
      };

      window.requestAnimationFrame(this.animate.bind(this));
    });
  } else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById("container").appendChild(warning);
  }
})();
