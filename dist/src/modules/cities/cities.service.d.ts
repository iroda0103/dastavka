import { DatabaseService } from 'src/database/database.service';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesService {
    private readonly databaseService;
    private readonly logger;
    constructor(databaseService: DatabaseService);
    create(createCityDto: CreateCityDto): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number, includeRelations?: boolean): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    private checkCityRelations;
}
