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

  findOne(AssetID: string) {
    return `This action returns a #${AssetID} asset`;
  }

  update(
    AssetID: string,
    updateAssetDTO: UpdateAssetDTO,
  ) {
    return `This action updates a #${AssetID} asset`;
  }

  remove(AssetID: string) {
    return `This action removes a #${AssetID} asset`;
  }
}
