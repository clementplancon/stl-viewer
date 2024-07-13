import { RouterOutlet } from '@angular/router';
import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls, STLLoader } from 'three/examples/jsm/Addons.js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit{
  title = 'stl-viewer';
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;
  renderer!: THREE.WebGLRenderer;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  mesh!: THREE.Mesh;
  material!: THREE.MeshPhongMaterial;
  loader!: STLLoader;
  controls!: OrbitControls;
  light!: THREE.DirectionalLight;
  ambientLight!: THREE.AmbientLight;

  constructor() {
    this.loader = new STLLoader();
  }

  ngAfterViewInit(): void {
    this.initThreeJs();
    this.onWindowResize();
  }

  initThreeJs(): void {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 0, 100);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0xcccccc);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.7;
    this.controls.zoomSpeed = 0.7;
    this.controls.panSpeed = 0.5;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 500;

    this.light = new THREE.DirectionalLight(0xffffff, 1.8);
    this.camera.add(this.light);
    this.camera.add(this.light.target);
    this.scene.add(this.camera);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(this.ambientLight);

    this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    this.loader = new STLLoader();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize(): void {
    const container = this.rendererContainer.nativeElement;
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderScene();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.onWindowResize();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.loadSTL(e.target.result);
      reader.readAsArrayBuffer(file);
    }
  }

  loadSTL(data: ArrayBuffer): void {
    const geometry = this.loader.parse(data);
    geometry.center();
    if (this.mesh) {
      this.scene.remove(this.mesh);
    }
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
    this.renderScene();
  }

  changeColor(event: any): void {
    const color = event.target.value;
    this.material.color.set(color);
    this.renderScene();
  }

  renderScene(): void {
    requestAnimationFrame(() => this.renderScene());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
