import { Injectable } from '@nestjs/common';
import { ImageDTO } from './dto/image.dto';
import { S3Service } from '../s3/s3.service';
import { AssetsService } from '../assets/assets.service';
import { RetrieveAllImagesDTO } from './dto/retrieve_all_images.dto';

@Injectable()
export class ImageManagerService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly assetsService: AssetsService,
  ) {}

  create(createImageDto: ImageDTO) {
    return 'This action adds a new imageManager';
  }

  findAll() {
    return `This action returns all imageManager`;
  }

  findOne(id: number) {
    return `This action returns a #${id} imageManager`;
  }

  update(id: number, updateImageDto: ImageDTO) {
    return `This action updates a #${id} imageManager`;
  }

  remove(id: number) {
    return `This action removes a #${id} imageManager`;
  }

  upload(
    uploadImageDto: ImageDTO,
  ): Promise<ImageDTO> {
    // TODO place the image in the database
    this.assetsService.createImage(
      uploadImageDto,
    );

    return this.s3Service.saveImage(
      uploadImageDto,
    );
  }

  retrieveAll(
    retrieveAllImagesDTO: RetrieveAllImagesDTO,
  ) {
    return this.assetsService.retrieveAll();
  }
}
