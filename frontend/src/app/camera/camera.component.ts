import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AssetService } from '../services/asset.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { set } from 'cypress/types/lodash';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;

  sysImage = '';
  originalImage = '';
  public sidebarVisible = false;
  assetName: string = '';
  videoRef: any;
  parentFolderId: string = '';
  path: string = '';
  isAsset: boolean = false;
  captured: boolean = false;
  flipCamera: boolean = false;
  cameraAvailable: boolean = false;
  settingCamera: boolean = false;
  contrastValue: number = 0;
  brightnessValue: number = 100;
  loading: boolean = false;

  constructor(
    private elementRef: ElementRef,
    private assetService: AssetService,
    private router: Router,
    private location: Location,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    const data = history.state;
    if (data) {
      this.parentFolderId = data['ParentFolderId'];
      this.path = data['Path'];
    }

    this.videoRef = document.getElementById('camera');

    this.setupCamera();
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#363232';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
    // this.elementRef.nativeElement.ownerDocument.body.style.width = '100vw';
    // this.elementRef.nativeElement.ownerDocument.body.style.height = '100vh';
  }

  navigateToPage(pageName: string) {
    this.disableCamera();
    this.router.navigate([`/${pageName}`]);
  }

  setupCamera() {
    this.settingCamera = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("getUserMedia is not supported in this browser.");
      this.cameraAvailable = false;
      return;
    }

    // Request camera access
    navigator.mediaDevices
      .getUserMedia({
        video: {},
        audio: false,
      })
      .then((stream) => {
        // Access granted, display the camera stream
        this.cameraAvailable = true;
        this.videoRef.srcObject = stream;
        this.settingCamera = false;
      })
      .catch((error) => {
        // Handle errors and permission denial
        console.error("Error accessing camera:", error);
        this.cameraAvailable = false;
        // You can show a user-friendly message on the page to inform the user about the camera access issue.
      });
  }



  disableCamera() {
    if (this.settingCamera) {
      let interval = setInterval(() => {
        try {
          this.videoRef.srcObject
            .getTracks()
            .forEach((track: { stop: () => any }) => track.stop());
          clearInterval(interval);
        } catch (e) {
        }
      }, 1000);
    }
    try {
      this.videoRef.srcObject
        .getTracks()
        .forEach((track: { stop: () => any }) => track.stop());
    } catch (e) {
    }
  }

  public getSnapshot(): void {
    const video: HTMLVideoElement = this.videoRef;

    // Create a canvas element with reduced dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth / 2; // Reduce the width by half
    canvas.height = video.videoHeight / 2; // Reduce the height by half

    // Draw the current frame of the video on the canvas
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the data URL of the canvas as a PNG image with reduced quality
    const dataUrl = canvas.toDataURL('image/jpeg', 1); // Adjust the quality (0.0 to 1.0)

    this.sysImage = dataUrl;
    this.originalImage = dataUrl;
    this.captured = true;
  }

  async uploadImage() {
    let format = 'image';
    if (this.isAsset) {
      format = 'text';
    }
    this.loading = true;
    await this.assetService
      .uploadImage(
        this.sysImage,
        this.path,
        this.assetName,
        this.parentFolderId,
        format
      )
      .then((res) => {
        if (res) {
          setTimeout(() => {
            this.loading = false;
            this.goBack();
          }, 1000);
        }
      });
    this.loading = false;
  }

  goBack() {
    this.disableCamera();
    this.location.back();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'r' && this.cameraAvailable && !this.captured) {
      this.getSnapshot();
      this.sidebarVisible = true;
    }
  }

  async adjustContrast(dataImage: string): Promise<string> {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.src = dataImage;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Adjust contrast
          const factor = (259 * (this.contrastValue + 255)) / (255 * (259 - this.contrastValue));
          for (let i = 0; i < data.length; i += 4) {
            data[i] = this.clamp(factor * (data[i] - 128) + 128);
            data[i + 1] = this.clamp(factor * (data[i + 1] - 128) + 128);
            data[i + 2] = this.clamp(factor * (data[i + 2] - 128) + 128);
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL());
        };
      } else {
        resolve(dataImage); // Return the original dataURL if the canvas context cannot be obtained
      }
    });
  }


  async adjustBrightness(dataImage: string): Promise<string> {
    return new Promise<string>((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.src = dataImage;
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          // Adjust brightness
          const factor = (this.brightnessValue - 100) / 100; // Calculate the brightness factor
          for (let i = 0; i < data.length; i += 4) {
            data[i] = this.clamp(data[i] + 255 * factor);
            data[i + 1] = this.clamp(data[i + 1] + 255 * factor);
            data[i + 2] = this.clamp(data[i + 2] + 255 * factor);
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL());
        };
      } else {
        resolve(dataImage); // Return the original dataURL if the canvas context cannot be obtained
      }
    });
  }


  async applyFilters() {
    const contrastImage = await this.adjustBrightness(this.originalImage);
    const brightnessImage = await this.adjustContrast(contrastImage);
    this.sysImage = brightnessImage;
  }

  clamp(value: number, min = 0, max = 255): number {
    return Math.min(max, Math.max(min, value));
  }

  resetFilters() {
    this.contrastValue = 0;
    this.brightnessValue = 100;
    this.sysImage = this.originalImage;
  }

}
