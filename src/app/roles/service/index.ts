import { Permission } from '@app/permissions/index.entity';
import { PermissionsService } from '@app/permissions/service';
import { BaseService } from '@app/Template/Base/Service';
import { Injectable } from '@nestjs/common';
import { CrudRequest } from '@nestjsx/crud';
import { isEqual, omit } from 'lodash';
import { CreateRoleDto } from '../dto/create.dto';
import { UpdateRoleDto } from '../dto/update.dto';
import { Role } from '../index.entity';
import { RolesRepository } from '../repository'

@Injectable()
export class RolesService extends BaseService<Role> {
  constructor(
    public repository: RolesRepository,
    public permissionsService: PermissionsService,
  ) { super(repository) }

  async createOne(req: CrudRequest, dto: any): Promise<Role> {
    await this.failIfDuplicated(omit(dto, ['permissionIds']))
    const role = await this.repository.create(dto as CreateRoleDto)
    
    if (dto.permissionIds.length > 0) {
      role.permissions = await 
        this.permissionsService.findManyByIdsOrFail(dto.permissionIds)
    }
    
    return this.repository.save(role)
  }

  async updateOne(req: CrudRequest, dto: any): Promise<Role> {
    const id: any = req.parsed.paramsFilter[0].value
    const { permissionIds } = dto as UpdateRoleDto
    const role = await this.findOneByIdOrFail(id)

    if (permissionIds && permissionIds.length > 0) {
      role.permissions = await 
        this.permissionsService.findManyByIdsOrFail(dto.permissionIds)
    }
    else {
      role.permissions = []
    }

    return role.save()
  }

  /**
   * @usage Returns permissions array by flatten roles then reduce 
   *        duplicated permissions prop in every role from roles array
   * 
   * @param roles User's roles array
   */
  static flattenRolesIntoPermissions(roles: Array<Role>): Array<Permission> {
    const permissions: Permission[] = []

    roles.forEach(role => {
      role.permissions.forEach(per => {
        /* If 'permissions' array does not contains 'per', push it in */
        if (!permissions.some(p => isEqual(p, per)))
          permissions.push(per)
      })
      /* Reduce permissions property out of 'role' object */
      delete role.permissions
    })

    return permissions
  }
}
