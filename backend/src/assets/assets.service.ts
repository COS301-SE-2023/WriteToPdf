import { Injectable } from '@nestjs/common';
import { CreateAssetDTO } from './dto/create-asset.dto';
import { UpdateAssetDTO } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  create(createAssetDTO: CreateAssetDTO) {
    return 'This action adds a new asset';
  }

  findAll() {
    return `This action returns all assets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asset`;
  }

  update(
    id: number,
    updateAssetDTO: UpdateAssetDTO,
  ) {
    return `This action updates a #${id} asset`;
  }

  remove(id: number) {
    return `This action removes a #${id} asset`;
  }
}
