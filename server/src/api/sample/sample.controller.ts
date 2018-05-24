import { Request, Response, NextFunction } from 'express';
import { SampleModel } from './sample.model';

export let controller = {
    get: (req: Request, res: Response, next: NextFunction) => {
        res.json(new SampleModel(true, "ok from get", Math.random()));
    },
    getById: (req: Request, res: Response, next: NextFunction) => {
        res.json({ok: true});
    },
    post: (req: Request, res: Response, next: NextFunction) => {
        res.json({ok: true});
    },
    put: (req: Request, res: Response, next: NextFunction) => {
        res.json({ok: true});
    },
    delete: (req: Request, res: Response, next: NextFunction) => {
        res.json({ok: true});
    },
};