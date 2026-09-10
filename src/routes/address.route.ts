import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    addressIdParamSchema,
    createAddressSchema,
} from "../validators/address.validator";
import * as addressController from "../controllers/address.controller";

const router = Router();

router.use(requireAuth);

router.get('/', addressController.listAddresses);
router.get('/:id', validate(addressIdParamSchema), addressController.getAddress);
router.post('/', validate(createAddressSchema), addressController.createAddress);

export default router;
