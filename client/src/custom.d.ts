declare module "*.jpg" {
    const value: string;
    export default value;
  }
  
declare module "*.png" {
    const value: string;
    export default value;
  }
  
declare module "*.jpeg" {
    const value: string;
    export default value;
  }

declare module 'react-router-hash-link' {
    import { ComponentType } from 'react';
    
    export const HashLink: ComponentType<any>;
  }
  
  