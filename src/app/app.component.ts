import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'photos';
  selectedFile: File | null = null;
  imageUrl: SafeResourceUrl | null = null;
  defaultImage: SafeResourceUrl;
  previewImage: any | ArrayBuffer | null = null;
  // Shape of the image frame
  currentShape: any = 'rectangle';

  // Variables for drag behavior
  posX = 0;
  posY = 0;
  scale = 1;
  isDragging = false;
  startX = 0;
  startY = 0;

  constructor(private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {
    this.defaultImage = this.sanitizer.bypassSecurityTrustResourceUrl('./assets/image.jpeg');
  }

  // Handle file input change and display image
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = e => {
        this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
        this.scale = 1;
        this.posX = 0;
        this.posY = 0;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // Change shape based on user selection
  onShapeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.currentShape = selectElement.value;
  }

  // Dragging starts
  onDragStart(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.clientX - this.posX;
    this.startY = event.clientY - this.posY;
  }

  // Dragging moves
  onDragMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.posX = event.clientX - this.startX;
      this.posY = event.clientY - this.startY;
    }
  }

  // Dragging ends
  onDragEnd(): void {
    this.isDragging = false;
  }

  // Zoom the image with scroll wheel
  onScrollZoom(event: WheelEvent): void {
    event.preventDefault();
    const zoomFactor = 0.1;

    if (event.deltaY < 0) {
      // Zoom in
      this.scale = Math.min(this.scale + zoomFactor, 3);
    } else {
      // Zoom out
      this.scale = Math.max(this.scale - zoomFactor, 1);
    }
  }

  // Save the selected image locally using localStorage
  saveImageLocally(): void {
    if (this.imageUrl) {
      localStorage.setItem('uploadedImage', this.imageUrl as string);
      alert('Image saved locally!');
    }
  }

  // Retrieve the saved image from localStorage on component initialization
  ngOnInit(): void {
    const savedImage = localStorage.getItem('uploadedImage');
    if (savedImage) {
      this.imageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(savedImage);
    }
  }

  // Clear the image
  clearImage(): void {
    localStorage.removeItem('uploadedImage');
    this.imageUrl = null;
    this.posX = 0;
    this.posY = 0;
    this.scale = 1;
  }
  onPreview(): void {
    this.currentShape
  }
  onSubmit(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      this.http.post('http://127.0.0.1:3000/upload', formData).subscribe({
        next: (response) => console.log('Image uploaded successfully', response),
        error: (error) => console.error('Error uploading image', error)
      });
    }
  }
}
