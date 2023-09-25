import { DiffDTO } from './diff.dto';
import { SnapshotDTO } from './snapshot.dto';

export class VersionHistoryDTO {
    DiffHistory: DiffDTO[]|undefined;
    SnapshotHistory: SnapshotDTO[]|undefined;
    RestorationDiffIndex: number|undefined;
    RestorationContent: string|undefined;

    constructor() {
        this.DiffHistory = undefined;
        this.SnapshotHistory = undefined;
        this.RestorationDiffIndex = undefined;
        this.RestorationContent = undefined;
    }
}

// For simplicity sake, we can treat restoring to a snapshot the same as restoring to the last diff in that set.