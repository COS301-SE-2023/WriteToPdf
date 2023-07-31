import { Component, ViewChild, ElementRef, HostListener } from '@angular/core';
import { AssetService } from '../services/asset.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;

  sysImage = '';
  public sidebarVisible = false;
  assetName: string = '';
  videoRef: any;
  parentFolderId: string = '';
  path: string = '';
  isAsset: boolean = false;
  captured: boolean = false;
  flipCamera: boolean = false;
  cameraAvailable: boolean = false;

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
      })
      .catch((error) => {
        // Handle errors and permission denial
        console.error("Error accessing camera:", error);
        this.cameraAvailable = false;
        // You can show a user-friendly message on the page to inform the user about the camera access issue.
      });
  }



  disableCamera() {
    try {
      this.videoRef.srcObject
        .getTracks()
        .forEach((track: { stop: () => any }) => track.stop());
    } catch (e) {
      console.log(e);
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
    this.captured = true;
  }

  async uploadImage() {
    let format = 'image';
    if (this.isAsset) {
      format = 'text';
    }
    this.assetService
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
            this.goBack();
          }, 1000);
        }
      });
  }

  goBack() {
    this.disableCamera();
    this.location.back();
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'r' && this.cameraAvailable) {
      this.getSnapshot();
      this.sidebarVisible = true;
    }
  }

}
