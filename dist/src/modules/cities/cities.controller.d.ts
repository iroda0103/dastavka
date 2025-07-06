import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
export declare class CitiesController {
    private readonly citiesService;
    constructor(citiesService: CitiesService);
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
    findOne(id: number, includeRelations?: string): Promise<{
        name: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<void>;
}
