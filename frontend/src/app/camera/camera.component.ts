import { Component, ViewChild, ElementRef } from '@angular/core';
import { ImageService } from '../services/image.service';
import { Router } from '@angular/router';

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

  constructor(private elementRef: ElementRef, private imageService: ImageService, private router: Router) { }

  ngOnInit() {
    this.videoRef = document.getElementById('camera');
    this.setupCamera();
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#FFFFFF';
    this.elementRef.nativeElement.ownerDocument.body.style.margin = '0';
  }

  navigateToPage(pageName: string) {
    this.disableCamera();
    this.router.navigate([`/${pageName}`]);
  }

  setupCamera() {
    navigator.mediaDevices.getUserMedia({
      video: {},
      audio: false
    }).then(stream => {
      this.videoRef.srcObject = stream;
    });
  }

  disableCamera() {
    this.videoRef.srcObject.getTracks().forEach((track: { stop: () => any; }) => track.stop());
  }

  public getSnapshot(): void {
    const video: HTMLVideoElement = this.videoRef;

    // Create a canvas element with reduced dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth / 2;  // Reduce the width by half
    canvas.height = video.videoHeight / 2;  // Reduce the height by half

    // Draw the current frame of the video on the canvas
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the data URL of the canvas as a PNG image with reduced quality
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);  // Adjust the quality (0.0 to 1.0)

    this.sysImage = dataUrl;
    console.log(dataUrl);
  }


  uploadImage() {
    this.imageService.uploadImage(this.sysImage, '',this.assetName);
  }

}
