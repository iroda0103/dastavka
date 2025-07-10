import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { DatabaseService } from '../../database/database.service';
import { menu } from '../../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateMenuDto) {
    this.logger.log(`Creating new product: ${createProductDto.name}`);

    try {
      // Create the values object with required fields first
      const productValues: any = {
        name: createProductDto.name,
        image: createProductDto.image,
        price: createProductDto.price.toString(),
      };

      this.logger.debug(
        `Product details: name=${createProductDto.name}, price=${createProductDto.price}`,
      );

      // Add optional fields if they exist
      if (createProductDto.description) {
        productValues.description = createProductDto.description;
      }

      if (createProductDto.restaurantId) {
        productValues.restaurantId = createProductDto.restaurantId; // Use restaurantId as per schema

        this.logger.debug(
          `Creating product for restaurant ID: ${createProductDto.restaurantId}`,
        );
      }

      const [product] = await this.databaseService.db
        .insert(menu)
        .values(productValues)
        .returning();

      this.logger.log(`Product created successfully with ID: ${product.id}`);
      return product;
    } catch (error) {
      // Handle unique constraint violations or other DB errors
      if (error.code === '23505') {
        // PostgreSQL unique violation code
        this.logger.warn(
          `Product creation failed: A product with this name already exists`,
        );
        throw new ConflictException('A product with this name already exists');
      }
      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to create product: ${error.message}`,
      );
    }
  }

  async findAll(restaurantId: number) {
    this.logger.log(`Finding all products for restaurant ID: ${restaurantId}`);

    try {
      let restaurantProducts = await this.databaseService.db
        .select({
          id: menu.id,
          name: menu.name,
          description: menu.description,
          image: menu.image,
          price: menu.price,
          createdAt: menu.createdAt,
          updatedAt: menu.updatedAt,
        })
        .from(menu)
        .where(eq(menu.restaurantId, restaurantId));

      // if (!restaurantProducts || restaurantProducts.length === 0) {
      //   this.logger.warn(
      //     `No products found for restaurant ID: ${restaurantId}`,
      //   );
      //   throw new NotFoundException(`No products found for the restaurant`);
      // }
      // restaurantProducts=restaurantProducts.length>0?restaurantProducts:[]

      this.logger.log(
        `Found ${restaurantProducts.length} products for restaurant ID: ${restaurantId}`,
      );
      return restaurantProducts;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error retrieving products for restaurant ${restaurantId}: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to get products for restaurant: ${error.message}`,
      );
    }
  }

  findOne(id: number) {
    this.logger.log(`Finding product with ID: ${id}`);
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateMenuDto) {
    this.logger.log(`Updating product with ID: ${id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateProductDto)}`);
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    this.logger.log(`Removing product with ID: ${id}`);
    return `This action removes a #${id} product`;
  }
}
