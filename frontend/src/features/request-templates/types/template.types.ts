import type { RequestCategory } from "@/features/requests/types/request.enums";
import type { AddressDto } from "@/features/requests/types/request.types";

export interface RequestTemplateListItemDto {
  id: string;
  name: string;
  title: string;
  category: RequestCategory;
  estimatedCost?: number;
  createdAt: string;
}

export interface RequestTemplateDetailsDto {
  id: string;
  name: string;
  title: string;
  description: string;
  category: RequestCategory;
  address: AddressDto;
  contactPerson?: string;
  contactPhone?: string;
  estimatedCost?: number;
  createdAt: string;
}
