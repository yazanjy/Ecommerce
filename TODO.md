# TODO - Fix TypeScript errors (ec-api)

- [ ] Fix `src/common/authorization/role-permissions.ts` to satisfy `Record<RoleType, PermissionType[]>`
- [ ] Fix `src/modules/auth/auth.controller.ts` express `Response` import for `isolatedModules`
- [ ] Fix `src/modules/auth/auth.module.ts` JWT `expiresIn` typing
- [ ] Define `src/modules/users/dto/create-user.dto.ts` fields used by service (email/password etc.)
- [ ] Fix mongoose `FilterQuery` import/usage in `src/modules/users/users.service.ts`
- [ ] Run `npm run start:dev` to verify build succeeds

