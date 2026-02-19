import { User } from '../users/entities/user.entity';
import { VendeursPublicService, ListResponse, VendeurPublicDetail } from './vendeurs-public.service';
import { VendeursQueryDto } from './dto/vendeurs-query.dto';
export declare class VendeursPublicController {
    private readonly vendeursPublicService;
    constructor(vendeursPublicService: VendeursPublicService);
    findAll(query: VendeursQueryDto, user: User): Promise<ListResponse>;
    findOne(id: string, user: User): Promise<VendeurPublicDetail>;
}
